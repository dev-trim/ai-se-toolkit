import os
import re
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_se_toolkit")

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Software Engineering Toolkit API",
    description="Backend API powering Architectural Modeling, Defect Auditing, Cost Estimation, and Test Synthesis",
    version="2.0.0"
)

# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# GROQ CLIENT SETUP
# ---------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ACTIVE_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
FALLBACK_MODEL = "qwen/qwen3.8-27b"

def get_groq_client() -> Groq:
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GROQ_API_KEY is not configured in the backend environment. Please check your .env file."
        )
    return Groq(api_key=GROQ_API_KEY)

def call_groq_json(system_prompt: str, user_prompt: str, model: str = ACTIVE_MODEL) -> dict:
    """Executes a chat completion in json_object mode with robust error recovery."""
    client = get_groq_client()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt + "\nReturn ONLY a valid JSON object."},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = completion.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.warning(f"Failed with model {model}: {e}. Retrying with fallback {FALLBACK_MODEL}...")
        try:
            completion = client.chat.completions.create(
                model=FALLBACK_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt + "\nReturn ONLY a valid JSON object."},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as fallback_err:
            logger.error(f"Groq API JSON error: {fallback_err}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq AI service error: {str(fallback_err)}"
            )

def call_groq_text(system_prompt: str, user_prompt: str, model: str = ACTIVE_MODEL) -> str:
    """Executes a chat completion returning clean text."""
    client = get_groq_client()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Failed with model {model}: {e}. Retrying with fallback {FALLBACK_MODEL}...")
        try:
            completion = client.chat.completions.create(
                model=FALLBACK_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1
            )
            return completion.choices[0].message.content.strip()
        except Exception as fallback_err:
            logger.error(f"Groq API Text error: {fallback_err}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq AI service error: {str(fallback_err)}"
            )

# ---------------------------------------------------------
# DATA SANITIZATION HELPERS
# ---------------------------------------------------------
def sanitize_str_list(raw_items) -> List[str]:
    """Ensures a list of items is cleanly formatted into strings, accommodating dicts or strings."""
    results = []
    if not isinstance(raw_items, list):
        if isinstance(raw_items, str):
            return [raw_items.strip()]
        return []
    for item in raw_items:
        if isinstance(item, str):
            text = item.strip()
            if text:
                results.append(text)
        elif isinstance(item, dict):
            title = item.get("title") or item.get("name") or item.get("id") or ""
            desc = item.get("description") or item.get("detail") or ""
            if title and desc:
                results.append(f"{title}: {desc}")
            elif desc:
                results.append(str(desc))
            elif title:
                results.append(str(title))
            else:
                results.append(" - ".join(f"{k}: {v}" for k, v in item.items() if v))
        elif item is not None:
            results.append(str(item))
    return results

def clean_mermaid_syntax(raw_code: str, diagram_type: str = "class") -> str:
    """Extracts and sanitizes Mermaid.js syntax from markdown backticks and conversational fluff."""
    cleaned = raw_code.strip()
    # Strip markdown code blocks
    cleaned = re.sub(r"^```(?:mermaid)?", "", cleaned, flags=re.MULTILINE | re.IGNORECASE)
    cleaned = re.sub(r"```$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()

    target_header = "classDiagram" if diagram_type.lower() == "class" else "sequenceDiagram"
    idx = cleaned.find(target_header)
    if idx != -1:
        cleaned = cleaned[idx:]
    else:
        # Prepend the required header if omitted by model
        cleaned = f"{target_header}\n" + cleaned

    # Strip any trailing markdown notes
    lines = cleaned.splitlines()
    filtered_lines = []
    for line in lines:
        stripped = line.strip()
        # Avoid lines that look like markdown headers or notes at the end
        if stripped.startswith("###") or stripped.startswith("Note:") or stripped.startswith("Explanation:"):
            break
        filtered_lines.append(line)

    return "\n".join(filtered_lines).strip()

# ---------------------------------------------------------
# PYDANTIC SCHEMAS
# ---------------------------------------------------------

# Module 1: Requirements Analysis
class ProjectBriefRequest(BaseModel):
    prompt: str = Field(..., min_length=5, description="Project scope or user stories")

class RequirementAnalysis(BaseModel):
    functional_requirements: List[str]
    non_functional_requirements: List[str]
    detected_entities: List[str]
    potential_risks: List[str]
    project_summary: Optional[str] = None
    complexity_rating: Optional[str] = "Medium"

# Module 2: UML Generator
class UMLRequest(BaseModel):
    project_description: str = Field(..., min_length=5)
    diagram_type: str = Field("class", description="Type of diagram: 'class' or 'sequence'")

class UMLResponse(BaseModel):
    diagram_type: str
    mermaid_code: str
    explanation: str

# Module 3: Effort Estimator
class EffortRequest(BaseModel):
    project_scope: str = Field(..., min_length=5)
    hourly_rate: float = Field(75.0, ge=10.0, le=500.0, description="Blended hourly engineering rate in USD")

class FunctionPointBreakdown(BaseModel):
    external_inputs: int
    external_outputs: int
    external_inquiries: int
    internal_logical_files: int
    external_interface_files: int

class PhaseBreakdown(BaseModel):
    requirements_pct: float
    architecture_pct: float
    implementation_pct: float
    testing_pct: float
    deployment_pct: float

class EffortResponse(BaseModel):
    function_points: int
    estimated_kloc: float
    person_months: float
    duration_months: float
    duration_weeks: float
    recommended_team_size: int
    estimated_total_cost: float
    breakdown: FunctionPointBreakdown
    phase_breakdown: PhaseBreakdown
    methodology_notes: str

# Module 4: Defect Predictor
class DefectRequest(BaseModel):
    source_code: str = Field(..., min_length=5)
    language: str = Field("python", description="Programming language: python, javascript, java, etc.")

class Vulnerability(BaseModel):
    title: str
    severity: str = "Medium"
    line: int = 1
    description: str
    mitigation: str

class DefectResponse(BaseModel):
    cyclomatic_complexity: int
    maintainability_index: int
    risk_level: str
    summary: str
    vulnerabilities: List[Vulnerability]
    refactoring_suggestions: List[str]

# Module 5: Test Case Manager
class TestGenerationRequest(BaseModel):
    requirement_text: str = Field(..., min_length=5)
    framework: Optional[str] = "pytest"

class TestCase(BaseModel):
    id: str
    category: str
    description: str
    expected_result: str
    priority: str

class TestResponse(BaseModel):
    test_suite_name: str
    total_tests: int
    test_cases: List[TestCase]
    code_template: Optional[str] = None

# Health Check Schema
class HealthStatus(BaseModel):
    status: str
    message: str
    active_model: str
    version: str
    api_key_configured: bool
    available_endpoints: List[str]


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

@app.get("/", response_model=HealthStatus)
@app.get("/api/status", response_model=HealthStatus)
def health_check():
    """Returns the operational status of the AI Software Engineering Toolkit API."""
    return HealthStatus(
        status="healthy",
        message="AI Software Engineering Toolkit API is online and fully connected.",
        active_model=ACTIVE_MODEL,
        version="2.0.0",
        api_key_configured=bool(GROQ_API_KEY),
        available_endpoints=[
            "/api/analyze-requirements",
            "/api/generate-uml",
            "/api/estimate-effort",
            "/api/predict-defects",
            "/api/generate-tests",
            "/api/status"
        ]
    )


# --- 1. REQUIREMENT ANALYZER ---
@app.post("/api/analyze-requirements", response_model=RequirementAnalysis)
async def analyze_requirements(request: ProjectBriefRequest):
    """Analyzes requirements from text and yields structured specifications and risks."""
    system_prompt = """You are a Principal Software Architect.
Analyze the provided project specification or user stories and extract:
1. functional_requirements (list of concise strings describing system functions)
2. non_functional_requirements (list of concise strings covering performance, security, scalability, reliability)
3. detected_entities (list of domain entities or data models)
4. potential_risks (list of technical, architectural, or integration risks)
5. project_summary (a crisp 2-sentence executive summary)
6. complexity_rating ("Low", "Medium", "High")

Format strictly as a JSON object with those exact keys. Each item in the lists must be a string."""

    data = call_groq_json(system_prompt, request.prompt)

    return RequirementAnalysis(
        functional_requirements=sanitize_str_list(data.get("functional_requirements", [])),
        non_functional_requirements=sanitize_str_list(data.get("non_functional_requirements", [])),
        detected_entities=sanitize_str_list(data.get("detected_entities", [])),
        potential_risks=sanitize_str_list(data.get("potential_risks", [])),
        project_summary=data.get("project_summary", "Comprehensive architectural specification derived from inputs."),
        complexity_rating=data.get("complexity_rating", "Medium")
    )


# --- 2. UML GENERATOR ---
@app.post("/api/generate-uml", response_model=UMLResponse)
async def generate_uml(request: UMLRequest):
    """Synthesizes valid Mermaid.js UML class or sequence diagrams with architectural explanations."""
    diagram_type_lower = request.diagram_type.lower().strip()
    if diagram_type_lower not in ["class", "sequence"]:
        diagram_type_lower = "class"

    if diagram_type_lower == "class":
        syntax_rules = """
- MUST begin with `classDiagram` on line 1.
- Declare classes with attributes (+type name) and methods (+returnType method()).
- Model relationships using:
  Inheritance: ClassA <|-- ClassB
  Composition: ClassA *-- ClassB
  Aggregation: ClassA o-- ClassB
  Association: ClassA --> ClassB : label
- Keep class names Alphanumeric with no spaces.
- Do NOT output markdown code fences (```) or explanatory text in the diagram."""
    else:
        syntax_rules = """
- MUST begin with `sequenceDiagram` on line 1.
- Declare participants using: participant Name as Alias or actor User
- Show interactions using:
  A->>B: Synchronous Call
  B-->>A: Return Response
  opt Optional flow
  alt Alternative flow
- Do NOT output markdown code fences (```) or explanatory text in the diagram."""

    system_prompt = f"""You are a Principal Systems Architect.
Generate clean, valid, compile-ready Mermaid.js syntax for a {diagram_type_lower} diagram modeling the system.

RULES:
{syntax_rules}
Output ONLY the raw Mermaid diagram syntax."""

    raw_diagram = call_groq_text(system_prompt, request.project_description)
    clean_diagram = clean_mermaid_syntax(raw_diagram, diagram_type_lower)

    # Explanation prompt
    explanation_prompt = f"""Provide a concise 2-sentence technical summary explaining what this {diagram_type_lower} diagram models:\n\n{clean_diagram}"""
    explanation = call_groq_text("You are an Enterprise Architect providing a brief explanation.", explanation_prompt)

    return UMLResponse(
        diagram_type=diagram_type_lower,
        mermaid_code=clean_diagram,
        explanation=explanation
    )


# --- 3. EFFORT ESTIMATOR ---
@app.post("/api/estimate-effort", response_model=EffortResponse)
async def estimate_effort(request: EffortRequest):
    """Calculates software effort, schedule, and team size using COCOMO II and Albrecht Function Point Analysis."""
    system_prompt = """You are a Software Cost Estimation Expert using standard IFPUG Function Point Analysis.
Evaluate the project scope and estimate the five Function Point components:
1. external_inputs (EI): number of transactions/forms entering system (int)
2. external_outputs (EO): number of reports, views, exports exiting system (int)
3. external_inquiries (EQ): number of interactive lookups/search operations (int)
4. internal_logical_files (ILF): number of core entity tables/databases maintained (int)
5. external_interface_files (EIF): number of external APIs, integrations, payment gateways (int)

Return valid JSON with keys: external_inputs, external_outputs, external_inquiries, internal_logical_files, external_interface_files."""

    fp_data = call_groq_json(system_prompt, request.project_scope)

    # Extract component counts with sensible minimums
    ei = max(1, int(fp_data.get("external_inputs", 12)))
    eo = max(1, int(fp_data.get("external_outputs", 8)))
    eq = max(1, int(fp_data.get("external_inquiries", 6)))
    ilf = max(1, int(fp_data.get("internal_logical_files", 5)))
    eif = max(1, int(fp_data.get("external_interface_files", 3)))

    # Standard IFPUG Average Complexity Weights:
    # EI: 4, EO: 5, EQ: 4, ILF: 10, EIF: 7
    ufp = (ei * 4) + (eo * 5) + (eq * 4) + (ilf * 10) + (eif * 7)

    # Convert Function Points to KLOC (Assuming modern high-level language: ~50 lines per FP)
    estimated_kloc = round(ufp * 0.05, 2)

    # COCOMO II Organic Model:
    # Effort (Person-Months) = 2.94 * (KLOC)^1.05
    # Schedule (Months) = 3.67 * (Effort)^0.32
    pm = round(2.94 * (max(estimated_kloc, 0.4) ** 1.05), 1)
    duration_months = round(3.67 * (max(pm, 0.5) ** 0.32), 1)
    duration_weeks = round(duration_months * 4.3, 1)

    recommended_team = max(1, round(pm / max(duration_months, 1.0)))

    # Cost calculation: 160 working hours per Person-Month
    estimated_cost = round(pm * 160 * request.hourly_rate, 2)

    phase_breakdown = PhaseBreakdown(
        requirements_pct=15.0,
        architecture_pct=20.0,
        implementation_pct=35.0,
        testing_pct=20.0,
        deployment_pct=10.0
    )

    methodology_notes = (
        f"Derived from IFPUG Function Point Analysis (UFP: {ufp}) mapped to {estimated_kloc} KLOC. "
        f"Effort and duration computed via COCOMO II Organic estimation model."
    )

    return EffortResponse(
        function_points=ufp,
        estimated_kloc=estimated_kloc,
        person_months=pm,
        duration_months=duration_months,
        duration_weeks=duration_weeks,
        recommended_team_size=recommended_team,
        estimated_total_cost=estimated_cost,
        breakdown=FunctionPointBreakdown(
            external_inputs=ei,
            external_outputs=eo,
            external_inquiries=eq,
            internal_logical_files=ilf,
            external_interface_files=eif
        ),
        phase_breakdown=phase_breakdown,
        methodology_notes=methodology_notes
    )


# --- 4. DEFECT PREDICTOR ---
@app.post("/api/predict-defects", response_model=DefectResponse)
async def predict_defects(request: DefectRequest):
    """Scans code for security vulnerabilities, cyclomatic complexity, and maintainability issues."""
    system_prompt = f"""You are a Lead Application Security Engineer and Code Quality Auditor.
Audit the following {request.language} code for:
1. cyclomatic_complexity (estimated integer score between 1 and 25)
2. maintainability_index (integer between 0 and 100, where 100 is cleanest)
3. risk_level ("Low", "Medium", "High", or "Critical")
4. summary (concise audit summary)
5. vulnerabilities: list of objects containing:
   - title (short title)
   - severity ("Critical", "High", "Medium", or "Low")
   - line (integer line number if identifiable, else 1)
   - description (detailed vulnerability root cause)
   - mitigation (concrete code remediation)
6. refactoring_suggestions: list of strings with architectural improvements

Return valid JSON conforming to these keys."""

    data = call_groq_json(system_prompt, request.source_code)

    raw_vulns = data.get("vulnerabilities", [])
    parsed_vulns: List[Vulnerability] = []
    if isinstance(raw_vulns, list):
        for v in raw_vulns:
            if isinstance(v, dict):
                try:
                    parsed_vulns.append(Vulnerability(
                        title=str(v.get("title", "Security Flaw")),
                        severity=str(v.get("severity", "Medium")),
                        line=int(v.get("line", 1) or 1),
                        description=str(v.get("description", "Vulnerability detected in source.")),
                        mitigation=str(v.get("mitigation", "Review and apply parameterized validation."))
                    ))
                except Exception:
                    continue

    return DefectResponse(
        cyclomatic_complexity=int(data.get("cyclomatic_complexity", 5)),
        maintainability_index=int(data.get("maintainability_index", 75)),
        risk_level=str(data.get("risk_level", "Medium")),
        summary=str(data.get("summary", "Automated static analysis completed.")),
        vulnerabilities=parsed_vulns,
        refactoring_suggestions=sanitize_str_list(data.get("refactoring_suggestions", []))
    )


# --- 5. TEST CASE MANAGER ---
@app.post("/api/generate-tests", response_model=TestResponse)
async def generate_tests(request: TestGenerationRequest):
    """Synthesizes structured test specifications and executable test suites from requirements."""
    framework_name = request.framework or "pytest"
    system_prompt = f"""You are a Principal QA Automation Architect.
Synthesize a comprehensive test suite for the given software requirement.
Requirements:
1. test_suite_name: string title
2. test_cases: list of objects containing:
   - id: string e.g. "TC-001"
   - category: string e.g. "Authentication", "Validation", "Boundary", "Security", "Performance"
   - description: clear test scenario
   - expected_result: exact expected outcome
   - priority: "High", "Medium", or "Low"
3. code_template: a clean, ready-to-run {framework_name} test script demonstrating test execution for this feature.

Return valid JSON with these keys."""

    data = call_groq_json(system_prompt, request.requirement_text)

    raw_tests = data.get("test_cases", [])
    parsed_tests: List[TestCase] = []
    if isinstance(raw_tests, list):
        for idx, t in enumerate(raw_tests, start=1):
            if isinstance(t, dict):
                parsed_tests.append(TestCase(
                    id=str(t.get("id") or f"TC-{idx:03d}"),
                    category=str(t.get("category", "Functional")),
                    description=str(t.get("description", "Validate feature functionality")),
                    expected_result=str(t.get("expected_result", "Operation succeeds with valid status")),
                    priority=str(t.get("priority", "Medium"))
                ))

    return TestResponse(
        test_suite_name=str(data.get("test_suite_name", "Automated Quality Assurance Test Suite")),
        total_tests=len(parsed_tests),
        test_cases=parsed_tests,
        code_template=data.get("code_template")
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
