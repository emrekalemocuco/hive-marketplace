# /hive-triage command - Orchestrated Jira ticket triage process
# Usage: /hive-triage <ticket-id>

```
██╗  ██╗██╗██╗   ██╗███████╗
██║  ██║██║██║   ██║██╔════╝
███████║██║██║   ██║█████╗
██╔══██║██║╚██╗ ██╔╝██╔══╝
██║  ██║██║ ╚████╔╝ ███████╗
╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
```

**🖤 AI-Powered Bug Fix Assistant**

**Welcome!** I'm Hive, your intelligent bug fix assistant.

I'll orchestrate a comprehensive triage analysis for you, coordinating specialized AI agents to:
- ✅ Validate your ticket and gather complete information
- ✅ Analyze visual evidence from screenshots (if available)
- ✅ Investigate your codebase deeply using workspace-aware search
- ✅ Identify root causes with high precision
- ✅ Review findings as senior engineer (quality control)
- ✅ Provide actionable recommendations with confidence levels

**Let's get started with ticket: {{arg1}}**

---

## 🔄 IMPORTANT: Automated Workflow Execution

This command executes **Steps 0-5 automatically without stopping**:
- Step 0: Input Validation
- Step 1: Jira Validation Agent
- Step 2: Vision Agent (if images exist)
- Step 3: Triage Agent
- Step 4: Orchestrator Senior Review ← You perform this
- Step 4.5: Classification Skill Invocation ← You invoke this
- Step 5: Report Generation ← You generate reports

**⚠️ CRITICAL: Do NOT pause between steps!**

- ❌ Do NOT wait for user confirmation after senior review
- ❌ Do NOT wait for user confirmation after classification
- ❌ Do NOT pause between any intermediate steps
- ✅ **ONLY pause at Step 6** to ask user about code implementation

**Execute the entire workflow (Steps 0-5) in one continuous flow.**
**Stop ONLY at Step 6 for user interaction.**

---

**ARCHITECTURE**: This command uses orchestrator pattern with specialized sub-agents to maintain context efficiency.

---

## ⚠️ MANDATORY FIRST ACTION
**BEFORE processing anything, YOU MUST display the welcome message (ASCII art + intro text) from the top of this file to the user.**

After displaying the welcome message, proceed to Step 0 below.

---

## Step 0: Input Validation ⚠️
**MANDATORY FIRST CHECK:**
```
if "{{arg1}}" is empty or undefined:
    ❌ ERROR: Ticket ID is required!

    Usage: /hive-triage <ticket-id>
    Example: /hive-triage HIVE-123

    Please provide a valid JIRA ticket ID and try again.

    STOP - Do not proceed to agent analysis.
```

## Step 1: Jira Ticket Validation & Data Collection 🔍
**Use specialized agent for validation and ticket.md creation:**

Use the **Task** tool to launch the **hive-bugfix-plugin:hive-jira-validation-agent**:
```
Task:
  subagent_type: "hive-jira-validation-agent"
  description: "Validate Jira ticket {{arg1}}"
  prompt: "Validate the Jira ticket: {{arg1}}

  Steps:
  1. Check if the ticket exists
  2. Validate its type (must be Bug)
  3. Get complete ticket information (details + comments)
  4. Create .hive/reports/{{arg1}}/ticket.md file with all ticket data
  5. Report attachment information

  Return structured JSON validation result with ticketFileCreated confirmation."
```

**Expected Output from Agent:**
```json
{
  "validationStatus": "success" | "error",
  "ticketExists": true | false,
  "ticketId": "{{arg1}}",
  "ticketType": "string",
  "isValidType": true | false,
  "hasAttachments": true | false,
  "totalAttachments": 0,
  "imageAttachments": 0,
  "imageFiles": ["filename1.png", "filename2.jpg"],
  "ticketFileCreated": true | false,
  "ticketFilePath": ".hive/reports/{{arg1}}/ticket.md",
  "errorMessage": "string (only if error)"
}
```

**Key Output**: `.hive/reports/{{arg1}}/ticket.md` file created with complete ticket information

**Process Validation Result:**
1. If `validationStatus === "error"`:
   - ❌ STOP pipeline
   - Display error message from validation result
   - Exit command

2. If `validationStatus === "success"`:
   - ✅ Continue to Step 1.5 (Non-Bug Ticket Check)
   - Save validation result for later use

---

## Step 1.5: Non-Bug Ticket Warning & User Confirmation ⚠️

**Purpose**: If ticket is not a Bug type, inform user and get confirmation to proceed.

### Check Ticket Type:

Parse the validation result from Step 1 and check `isValidType` field:

```javascript
const validation = {validation result from Step 1};

if (validation.isValidType === false) {
  // Non-bug ticket detected - warn user and ask for confirmation

  // 1. Display Warning
  console.log(`
    ⚠️ TICKET TYPE WARNING

    Ticket: ${validation.ticketId}
    Type: ${validation.ticketType} (Not a Bug)

    ${validation.warningMessage}

    **Important**: Hive is optimized for Bug ticket analysis.
    Analyzing a ${validation.ticketType} ticket may produce less relevant or optimal results.

    Common non-bug types:
    - Story: Feature requests or user stories
    - Task: General work items or chores
    - Epic: Large initiatives (too broad for detailed triage)
    - Sub-task: Part of a larger ticket
  `);

  // 2. Ask User for Confirmation
  AskUserQuestion({
    questions: [{
      question: `This is a ${validation.ticketType} ticket, not a Bug. Would you like to proceed with analysis anyway?`,
      header: "Non-Bug Ticket",
      multiSelect: false,
      options: [
        {
          label: "Yes, proceed with analysis",
          description: `Continue triage analysis for this ${validation.ticketType}. Hive will do its best, but results may be less optimal than for Bug tickets.`
        },
        {
          label: "No, stop here",
          description: "Stop the workflow. Use Hive with Bug tickets for best results."
        }
      ]
    }]
  });

  // 3. Process User Response
  {User will select an option}

  if (userSelection === "Yes, proceed with analysis") {
    // User confirmed - continue workflow
    console.log(`✓ User confirmed - proceeding with ${validation.ticketType} analysis...`);
    console.log(`⚠️ Note: Results may differ from typical Bug analysis.`);
    // → Continue to Step 2 (Vision Analysis)
  }

  if (userSelection === "No, stop here") {
    // User declined - graceful exit
    console.log(`
      ✅ Workflow stopped at user request.

      💡 **Tip**: Hive provides best results with Bug tickets.

      If you have a Bug ticket to analyze, run:
      /hive-triage <bug-ticket-id>
    `);
    // → Exit workflow gracefully
    return;
  }
}

// If isValidType === true (Bug ticket):
// → Skip this entire step, continue directly to Step 2
```

### Sequential Checkpoint:

```
✅ Checkpoint: Ticket type validated
   - Bug ticket: Proceed automatically (no prompt)
   - Non-bug ticket: User confirmation obtained or workflow stopped

→ Continue to Step 2 (Vision Analysis)
```

---

## Step 2: Vision Analysis (Conditional) 🖼️
**Use specialized vision agent for image attachment analysis:**

### 2.1 Decision Point:
```
if validation result shows imageAttachments > 0:
    → Proceed with vision analysis (Step 2.2)
else:
    → Skip vision analysis, go to Step 3
```

### 2.2 Launch Vision Agent (If Images Exist):
**Use Task tool to launch hive-bugfix-plugin:hive-vision-agent:**
```
Task:
  subagent_type: "hive-bugfix-plugin:hive-vision-agent"
  description: "Analyze image attachments for {{arg1}}"
  prompt: "Perform pure visual analysis of image attachments for Jira ticket: {{arg1}}

  TASK:
  1. Use mcp__plugin_hive-bugfix-plugin_hive-mcp__jira_list_attachments to get all attachments
  2. Filter for image files (PNG, JPG, GIF, BMP, WebP)
  3. Use mcp__plugin_hive-bugfix-plugin_hive-mcp__jira_read_attachment to read each image
  4. Analyze each image - describe what you see objectively:
     - UI elements, text, colors, layout
     - Positions, highlights, selections
     - Visual composition
  5. Save your analysis to: .hive/reports/{{arg1}}/vision.md

  IMPORTANT:
  - Use ONLY the provided hive-mcp Jira tools
  - NO ticket interpretation - pure visual description only
  - If any tool fails, create error report in vision.md with exact error message"
```

### 2.3 Wait for Vision Agent Completion:
**CRITICAL: Do NOT proceed to Step 3 until vision analysis is complete**

1. **Wait for agent to finish:**
   - Vision agent creates `.hive/reports/{{arg1}}/vision.md`
   - Agent returns completion signal

2. **Verify vision.md exists:**
   - Check if file `.hive/reports/{{arg1}}/vision.md` was created
   - If exists: ✅ Vision analysis complete
   - If not exists: ⚠️ Vision agent failed (but continue pipeline)

3. **Handle vision agent errors:**
   - If vision agent reports tool access errors:
     - Log the error for debugging
     - Note: Vision is supplementary, not required
     - Continue to Step 3 (triage can proceed without vision)
   - If vision.md created but with errors:
     - Triage agent will read error report
     - Triage agent adapts to limited info

### 2.4 Sequential Checkpoint:
```
✅ Checkpoint: Vision analysis complete or skipped
   - vision.md exists: Triage agent will use it
   - vision.md missing: Triage agent will skip visual context
   - Ready to proceed to Step 3
```

**If no images (from Step 2.1):**
- Skip all of Step 2.2-2.4
- Proceed directly to Step 3

## Step 3: Triage Analysis 🔬
**Use specialized agent for code investigation and analysis:**

Use the **Task** tool to launch the **hive-bugfix-plugin:hive-triage-agent**:
```
Task:
  subagent_type: "hive-triage-agent"
  description: "Perform triage analysis for {{arg1}}"
  prompt: "Perform comprehensive triage analysis for Jira ticket: {{arg1}}

  Analysis Steps:
  1. Read complete ticket information from: .hive/reports/{{arg1}}/ticket.md
     - This file was created by validation agent
     - Contains: ticket details, description, all comments, attachments list
     - NO need to call Jira MCP tools (faster, no duplicate API calls)
  2. Check for vision report at: .hive/reports/{{arg1}}/vision.md
     - If exists: Read it for visual attachment insights
     - Extract error messages from screenshots
     - Identify if errors are backend or frontend related
  3. Investigate codebase using repository-aware Sourcegraph search:
     - Backend errors → Search repo:github.com/Ocuco/A3.WebServices
     - Frontend issues → Search repo:github.com/Ocuco/A3.Application
     - Cross-reference between repos when needed
  4. Correlate visual findings (if any) with code locations
  5. Perform root cause analysis
  6. Provide structured analysis output

  Return your analysis in the specified structured format (JSON or Markdown)."
```

**Expected Output from Agent:**
Structured analysis containing:
- Ticket details (id, summary, status, priority, reporter, assignee) - from ticket.md
- Analysis (rootCause, impacts, severity, urgency, risk) - from code investigation
- Code analysis (affected files, error patterns, root cause location) - from Sourcegraph search
- Recommendations (immediate actions, solution approach, estimates)
- Dependencies and risks
- Next steps

**Note**: The triage agent reads ticket.md (no Jira calls) and vision.md (if exists) for complete context.

## Step 4: Orchestrator Review & Validation 🔍
**Quality control - Senior review of triage findings:**

**Purpose**: The orchestrator acts as a senior engineer to validate, enhance, and correct the triage agent's analysis before generating the final report.

**CRITICAL: You are the orchestrator - a senior engineer with broader perspective**

The triage agent has provided initial analysis. Your responsibility is to:
1. **Review** for accuracy and completeness
2. **Investigate** alternative root causes
3. **Verify** code locations and findings
4. **Enhance** recommendations based on additional investigation
5. **Correct** any errors or oversights found

### Review Process:

**1. Read Triage Agent's Output**

Carefully review the structured analysis from Step 3:
- Root cause identification
- Affected files and locations
- Solution approach
- Confidence level

**2. Independent Investigation (Fresh Perspective)**

**Re-read context files** with critical eye:
```javascript
// Re-read ticket for missed clues
Read('.hive/reports/{{arg1}}/ticket.md');

// Re-read vision for overlooked details
Read('.hive/reports/{{arg1}}/vision.md'); // if exists
```

**Search for alternative causes**:
```javascript
// Extract error patterns from agent's analysis
// Search for related patterns agent might have missed

Grep('alternative error pattern', {
  path: 'src/',
  output_mode: 'files_with_matches'
});

// Find related files agent didn't investigate
Glob('**/*potential-related-file*');
Glob('**/*similar-module*');
```

**Verify agent's root cause location**:
```javascript
// Read the file agent identified as root cause
Read('src/file-from-agent-analysis.ts');

// Check surrounding context for other possibilities
Grep('error pattern', {
  path: 'src/file-from-agent-analysis.ts',
  output_mode: 'content',
  '-C': 10  // Show more context
});

// Look for similar error patterns elsewhere
Grep('same error pattern', {
  path: 'src/',
  output_mode: 'files_with_matches'
});
```

**Investigate alternative scenarios**:
```bash
# Check git history for similar bugs
git log --all --grep="similar error"

# Find recent changes to affected areas
git log -p -n 5 -- <affected_file>
```

**3. Compare & Validate Findings**

**Validation Questions:**
- ✅ Is agent's root cause correct?
- ✅ Are there other possible causes?
- ✅ Are all affected files identified?
- ✅ Is the solution approach optimal?
- ✅ Are risks properly assessed?
- ✅ Is confidence level appropriate?

**Decision Logic:**

**If agent's analysis is CORRECT and COMPLETE**:
```json
{
  ...agentAnalysis,
  orchestratorReview: {
    reviewPerformed: true,
    reviewDate: "{current_date}",
    correctionsM ade: [],
    additionalFindings: [],
    alternativeCauses: [],
    validationStatus: "VALIDATED - Analysis confirmed accurate",
    confidenceAdjustment: "Maintained - No changes needed"
  }
}
```

**If you find ISSUES or MISSING INFORMATION**:
```json
{
  ...agentAnalysis,
  // CORRECT the fields that are wrong
  analysis: {
    ...agentAnalysis.analysis,
    rootCause: "CORRECTED: More accurate root cause after orchestrator review...",
    severity: "Adjusted from Medium to High after verification"
  },
  codeAnalysis: {
    ...agentAnalysis.codeAnalysis,
    affectedFiles: [...agentFiles, "additional-file-found-by-orchestrator.ts"],
    rootCauseLocation: "CORRECTED: actual-file.ts:123 (was: wrong-file.ts:456)"
  },
  recommendations: {
    ...agentAnalysis.recommendations,
    solutionApproach: "ENHANCED: Better approach after investigating alternatives..."
  },
  orchestratorReview: {
    reviewPerformed: true,
    reviewDate: "{current_date}",
    correctionsM ade: [
      "Corrected root cause location from wrong-file.ts:456 to actual-file.ts:123",
      "Added missing affected file: additional-file.ts",
      "Adjusted severity from Medium to High based on business impact"
    ],
    additionalFindings: [
      "Found related issue in ModuleX that contributes to the bug",
      "Identified missing error handling in ModuleY",
      "Discovered similar bug fixed in commit abc123 (can learn from it)"
    ],
    alternativeCauses: [
      {
        "cause": "Configuration mismatch in timeout.json",
        "likelihood": "High",
        "location": "config/timeout.json:45",
        "evidence": "Found timeout set to 30s but documentation says 60s"
      },
      {
        "cause": "Race condition in async auth flow",
        "likelihood": "Medium",
        "location": "src/auth/AsyncHandler.ts:234",
        "evidence": "No mutex lock on shared session state"
      }
    ],
    confidenceAdjustment: "Increased from Medium to High after verification and additional investigation",
    validationNotes: "Verified all code locations. Tested alternative hypotheses. Enhanced solution approach with better error handling strategy."
  }
}
```

**3.5. Linked Issues Investigation (Optional - On-Demand)**

**Purpose**: If triage analysis feels insufficient or unclear, investigate linked/mentioned tickets for additional context.

**Decision Criteria** (Use professional judgment):
- ❓ Is root cause unclear from main ticket alone?
- ❓ Do linked issues have relevant context? (especially "Blocks", "Is Blocked By", "Causes")
- ❓ Are there unresolved questions that related tickets might answer?
- ❓ Does triage agent's analysis mention linked issues as potentially relevant?

**If YES - Linked issues investigation needed:**

**Step 3.5.1: Read Related Tickets**:
```javascript
// Read ticket.md to get linked/mentioned tickets
const ticketData = await Read({
  file_path: `.hive/reports/{ticketId}/ticket.md`
});

// Parse "Related Tickets" section
// Extract: linkedIssues array, mentionedTickets array
```

**Step 3.5.2: Prioritize Related Tickets**:
```javascript
// Prioritize by relationship type:
Priority 1: "Blocks", "Is Blocked By", "Causes", "Is Caused By"
Priority 2: "Duplicates", "Is Duplicated By"
Priority 3: "Relates To"

// Focus on 1-3 most relevant linked issues (token efficiency)
```

**Step 3.5.3: Check for Images**:
```javascript
// For each prioritized linked issue:
for (const linkedIssue of topPriorityLinkedIssues) {
  // Check if linked issue has images
  const linkedAttachments = await mcp__plugin_hive-bugfix-plugin_hive-mcp__jira_list_attachments({
    issueIdOrKey: linkedIssue.key
  });

  const linkedImages = linkedAttachments.filter(att =>
    att.mimeType.startsWith('image/')
  );

  if (linkedImages.length > 0) {
    // This linked issue has images - might be valuable
    linkedIssuesWithImages.push({
      ...linkedIssue,
      imageCount: linkedImages.length
    });
  }
}
```

**Step 3.5.4: Invoke Vision Agent (Append Mode)**:

**Only if** linked issue has valuable context AND images:

```javascript
// Invoke vision agent for linked issue
Task({
  subagent_type: "hive-vision-agent",
  description: `Analyze images from linked issue ${linkedIssue.key}`,
  prompt: `Analyze image attachments for linked issue: ${linkedIssue.key}

  Main ticket: {mainTicketId}
  Relationship: "${linkedIssue.linkType} - ${linkedIssue.relationship}"
  Append to existing vision report: true

  Analyze all images from ${linkedIssue.key} and append results to existing vision.md.
  Include relationship context in the section header.
  `
});

// Wait for vision.md update to complete
// Vision agent will append new section to existing vision.md
```

**Step 3.5.5: Re-read Vision Report**:
```javascript
// Read updated vision.md with linked issue context
const updatedVisionReport = await Read({
  file_path: `.hive/reports/{ticketId}/vision.md`
});

// Now have additional visual context from linked issues
// Use this in enhanced analysis
```

**Step 3.5.6: Enhance Analysis with Linked Issue Insights**:
```javascript
// Add to orchestratorReview.additionalFindings:
additionalFindings.push(
  `Analyzed linked issue ${linkedIssue.key} (${linkedIssue.linkType})`,
  `Found ${imageCount} additional images showing: {brief summary}`,
  `Linked issue context: {relevant insights}`
);
```

**Example Scenario**:
```
Triage finding: "Auth timeout happening, unclear why"

Step 3.5 Investigation:
  → Read ticket.md, found linked issues:
     - ACPC-123 (Is Blocked By): "Auth service performance degradation"
     - ACPC-456 (Relates To): "Timeout configuration update"

  → ACPC-123 has relationship "Is Blocked By" (high priority)
  → Check ACPC-123 for images: Found 3 images (performance charts)

  → Decision: Analyze ACPC-123 images (might explain why auth is timing out)

  → Invoke vision agent (append mode):
     - Analyzes ACPC-123 images
     - Appends to vision.md under "Linked Issue: ACPC-123" section

  → Re-read vision.md
  → Enhanced finding: "Auth timeout caused by performance degradation in ACPC-123 (CPU spikes shown in performance charts)"
```

**If NO - Skip linked issues investigation:**
- Triage analysis is sufficient
- No linked issues with relevant context
- Token efficiency (don't waste on unrelated links)

---

**4. Final Enhanced Analysis**

Return the enhanced/corrected analysis (possibly with linked issue insights) for report generation in Step 5.

### Review Tools Available:

**For Investigation:**
- `Read` - Re-read context files, verify code locations
- `Grep` - Search for alternative patterns
- `Glob` - Find related files agent missed
- `Bash` - Git history analysis

**Review Intensity:**
- **Light Review**: Agent analysis looks good → Just add validation
- **Deep Review**: Agent analysis has gaps → Investigate and enhance
- **Correction Mode**: Agent analysis is wrong → Correct and document

### Success Criteria:

**Review is complete when:**
- ✅ Agent's root cause validated or corrected
- ✅ Alternative causes investigated
- ✅ Code locations verified
- ✅ Solution approach assessed
- ✅ Additional findings documented
- ✅ Confidence level adjusted appropriately
- ✅ Enhanced analysis ready for report generation

**Sequential Checkpoint:**
```
✅ Checkpoint: Orchestrator review complete
   - Agent analysis validated/enhanced
   - Alternative causes investigated
   - Corrections documented
   → Continuing immediately to classification (Step 4.5)

⚠️ DO NOT PAUSE - Proceed automatically to Step 4.5 (Classification)
```

---

## Step 4.5: Issue Classification (via Classification Skill) 🔍

**Purpose**: Classify the issue type based on triage findings to determine if it's a code bug, configuration issue, infrastructure problem, or other category.

### Process:

**1. Prepare Context for Classification Skill**

The enhanced triage analysis from Step 4 is now available. Context includes:
- Ticket details (from `.hive/reports/{ticketId}/ticket.md`)
- Vision analysis (from `.hive/reports/{ticketId}/vision.md` if exists)
- Triage analysis with orchestrator enhancements
- Root cause identified
- Error patterns and messages
- Code analysis findings
- Environment clues

**2. Invoke Classification Skill**

Use the Skill tool to explicitly invoke the `hive-classification` skill:

```markdown
I need to classify this issue based on the triage findings.

**Triage Summary**:
- Ticket ID: {ticketId}
- Root Cause: {analysis.rootCause}
- Affected Files: {codeAnalysis.affectedFiles}
- Error Patterns: {codeAnalysis.errorPatterns}
- Severity: {analysis.severity}

**Evidence from Investigation**:
- Symptoms: {from ticket and vision}
- Error messages: {from logs, screenshots}
- Environment behavior: {works in dev? fails in prod?}
- Recent changes: {deployments, config changes}
- Code findings: {what code analysis revealed}

Please classify this issue and generate diagnostic checklist if applicable.
```

The skill will return a **Markdown report** (not JSON).

**3. Save Classification Report**

Take the markdown output from the skill and save it to:
`.hive/reports/{ticketId}/classification.md`

Use the Write tool:
```
Write({
  file_path: `.hive/reports/{ticketId}/classification.md`,
  content: {markdown output from classification skill}
})
```

**4. Parse Classification Metadata**

Read the classification.md file and extract key metadata for orchestration:

Parse these values from the markdown:
- **Primary Category**: Extract from line "**Category**: {value}"
- **Confidence**: Extract from line "**Confidence**: {value}"
- **Secondary Category**: Extract from line "**Secondary Category**: {value}" (if exists)

Store this metadata in `issueClassification` object:
```json
{
  "primaryCategory": "Configuration Issue",
  "confidence": "High",
  "confidenceScore": 92,
  "hasDiagnosticChecklist": true,
  "reportPath": ".hive/reports/{ticketId}/classification.md"
}
```

**Parsing Example**:
```
From markdown line: "**Category**: Configuration Issue"
Extract: primaryCategory = "Configuration Issue"

From markdown line: "**Confidence**: High (92%)"
Extract: confidence = "High", confidenceScore = 92
```

This metadata will be used in:
- **Step 6**: Dynamic user prompt (determine which scenario based on primaryCategory)
- **Step 5**: Triage report (reference classification.md file)

**5. Validate Classification**

Quick validation checks on parsed metadata:
- Does primaryCategory match root cause analysis?
- Is confidence level reasonable given evidence?
- If confidence is Low (<50%), flag for manual review
- If Hybrid, verify both categories are legitimate

**6. Add Classification Metadata to Analysis**

Add parsed classification metadata to the enhanced analysis structure:
```json
{
  ...enhancedTriageAnalysis,
  "issueClassification": {
    "primaryCategory": "{parsed from classification.md}",
    "confidence": "{parsed from classification.md}",
    "confidenceScore": {parsed from classification.md},
    "secondaryCategory": "{parsed if exists}",
    "hasDiagnosticChecklist": true/false,
    "reportPath": ".hive/reports/{ticketId}/classification.md",
    "classificationDate": "{current_timestamp}",
    "classifiedBy": "hive-classification-skill"
  }
}
```

**Note**: The full classification report is saved as a separate file (classification.md).
Only metadata is stored in the analysis object for orchestration purposes.

### Classification Categories Overview:

| Category | Typical Indicators | Diagnostic Checklist? |
|----------|-------------------|----------------------|
| **Code Bug** | Logic error, null pointer, algorithm bug | No (code fix needed) |
| **Configuration Issue** | Missing env var, wrong config, API key | Yes (5-8 steps) |
| **Infrastructure Issue** | Deployment, network, permissions, resources | Yes (5-8 steps) |
| **Data Issue** | Wrong/missing DB data, corruption | Yes (5-8 steps) |
| **External Service Issue** | Third-party API down, rate limits | Yes (5-8 steps) |
| **Hybrid** | Multiple categories combined | Yes (for non-code parts) |
| **Insufficient Evidence** | Unclear, needs more investigation | Yes (investigation steps) |

### Diagnostic Checklist Benefits:

For non-code issues (Configuration, Infrastructure, Data, External Service):
- ✅ **Ticket-specific steps**: Uses actual names from triage (env vars, files, APIs)
- ✅ **Executable commands**: Developer can copy-paste and run
- ✅ **Prioritized**: Critical → High → Medium → Low
- ✅ **Actionable**: No generic placeholders or guessing

**Example Diagnostic Checklist** (Configuration Issue - Google Maps API):
```
1. [Critical] Verify GOOGLE_MAPS_API_KEY exists in production
   → echo $GOOGLE_MAPS_API_KEY
2. [Critical] Check API key permissions in Google Cloud Console
   → Navigate to APIs & Services, verify Maps JavaScript API enabled
3. [High] Verify domain restrictions allow production domain
   → Check HTTP referrers whitelist includes yourapp.com
4. [High] Check API quota usage and billing status
   → Dashboard shows <100% quota, billing active
5. [Medium] Compare dev vs prod configuration
   → diff .env.development .env.production
```

### Sequential Checkpoint:

```
✅ Checkpoint: Issue classification complete
   - Classification determined: {primaryCategory}
   - Confidence: {confidence} ({confidenceScore}%)
   - Diagnostic checklist generated (if applicable)
   → Continuing immediately to report generation (Step 5)

⚠️ DO NOT PAUSE - Proceed automatically to Step 5 (Report Generation)
```

---

## Step 5: Generate Triage Report 📄
**Orchestrator generates final report from enhanced analysis:**

**ONLY if triage agent analysis was successful:**

1. Use the following markdown template format and fill in ALL the template variables with actual data from the analysis:

```markdown
# 🏗️ Hive Triage Analysis Report

**Generated**: {date}
**Ticket ID**: {ticketId}
**Analysis By**: Hive Triage Agent
**Report Version**: 1.0

---

## 📋 Ticket Details

| Field | Value |
|-------|-------|
| **ID** | {ticketDetails.id} |
| **Summary** | {ticketDetails.summary} |
| **Status** | {ticketDetails.status} |
| **Priority** | {ticketDetails.priority} |
| **Reporter** | {ticketDetails.reporter} |
| **Assignee** | {ticketDetails.assignee} |

---

## 📊 Analysis Results

### 🔍 Root Cause Analysis
{analysis.rootCause}

### 📈 Impact Assessment

#### Business Impact
{analysis.businessImpact}

#### User Impact
{analysis.userImpact}

#### Technical Impact
{analysis.technicalImpact}

### 🎯 Priority Classification

| Metric | Assessment |
|--------|------------|
| **Severity** | {analysis.severity} |
| **Urgency** | {analysis.urgency} |
| **Risk Level** | {analysis.riskLevel} |

---

## 🔍 Orchestrator Review & Validation

**Review Date**: {orchestratorReview.reviewDate}
**Validation Status**: {orchestratorReview.validationStatus}

### Quality Control Assessment

{orchestratorReview.validationNotes}

{if orchestratorReview.correctionsM ade.length > 0:}
### Corrections Made

{for each correction in orchestratorReview.correctionsM ade:}
- {correction}

{if orchestratorReview.additionalFindings.length > 0:}
### Additional Findings

{for each finding in orchestratorReview.additionalFindings:}
- {finding}

{if orchestratorReview.alternativeCauses.length > 0:}
### Alternative Root Causes Investigated

{for each cause in orchestratorReview.alternativeCauses:}
**{cause.likelihood} Likelihood**: {cause.cause}
- **Location**: `{cause.location}`
- **Evidence**: {cause.evidence}

### Confidence Adjustment

{orchestratorReview.confidenceAdjustment}

---

{if issueClassification:}
## 🔍 Issue Classification

📄 **Full Classification Report**: [classification.md](classification.md)

### Quick Summary

- **Category**: {issueClassification.primaryCategory}
{if issueClassification.secondaryCategory:}- **Secondary Category**: {issueClassification.secondaryCategory}
- **Confidence**: {issueClassification.confidence} ({issueClassification.confidenceScore}%)
- **Diagnostic Checklist Available**: {issueClassification.hasDiagnosticChecklist ? 'Yes ✅' : 'No (code fix needed)'}

### What This Means

{if issueClassification.primaryCategory in ["Configuration Issue", "Infrastructure Issue", "Data Issue", "External Service Issue"]:}
This appears to be a **{issueClassification.primaryCategory}** rather than a code bug.

✅ **Action Required**: Review the diagnostic checklist in `classification.md` to verify and fix the root cause.

💡 **Recommended**: Fix the {issueClassification.primaryCategory} first. Code changes may not be necessary for the root cause, but defensive improvements can be added optionally.

{else if issueClassification.primaryCategory === "Code Bug":}
This is a **Code Bug** requiring code changes to fix.

✅ **Action Required**: Implement code fix based on root cause analysis and recommendations below.

{else if issueClassification.primaryCategory === "Hybrid":}
This is a **Hybrid Issue** requiring both configuration/infrastructure fixes AND code improvements.

✅ **Action Required**:
1. First, address the non-code aspects using the diagnostic checklist in `classification.md`
2. Then, implement code improvements for better handling and error prevention

{else if issueClassification.primaryCategory === "Insufficient Evidence":}
⚠️ **Warning**: Classification confidence is low. More investigation may be needed.

✅ **Action Required**: Review investigation steps in `classification.md` to gather more information.

For detailed classification analysis, evidence breakdown, and diagnostic steps, see: **[classification.md](classification.md)**

---

## 💡 Recommendations

### ⚡ Immediate Actions
{recommendations.immediateActions}

### 🛠️ Solution Approach
{recommendations.solutionApproach}

### 📊 Effort Estimation

| Estimate Type | Value |
|---------------|-------|
| **Story Points** | {recommendations.storyPoints} |
| **Time Estimate** | {recommendations.timeEstimate} |
| **Confidence Level** | {recommendations.confidence} |

---

## 🔗 Dependencies & Risk Assessment

### 📋 Related Issues
{dependencies.relatedIssues}

### 🚧 Potential Blockers
{dependencies.blockers}

### ⚠️ Risk Factors & Mitigation
{risks.factors}

---

## 📈 Next Steps & Action Plan

### 🎯 Recommended Actions
{nextSteps.actions}

### ✅ Success Criteria
- [ ] Root cause identified and confirmed
- [ ] Solution approach validated with stakeholders
- [ ] Resource allocation approved
- [ ] Implementation timeline established
- [ ] Risk mitigation strategies in place

---

## 📋 Triage Summary

This comprehensive analysis provides a systematic evaluation of the reported issue, including root cause identification, impact assessment, and actionable recommendations for resolution. The analysis is based on structured investigation using Hive's AI-powered triage capabilities.

### Key Findings
- **Primary Issue**: Root cause analysis completed
- **Business Priority**: Impact assessment provided
- **Technical Scope**: Solution approach defined
- **Implementation**: Effort estimates with confidence levels

---

*Generated by **Hive** - AI-Powered Bug Fix Assistant*
*🖤 Proudly presented by **Blackbird Team***

*Report generated on {date} | For technical questions, contact your development team*
```

2. Replace placeholders with actual data from the analysis:
   - {date} - Current date (YYYY-MM-DD format)
   - {ticketId} - The ticket ID from {{arg1}}
   - {ticketDetails.*} - Ticket information from agent
   - {analysis.*} - Analysis results from agent
   - {recommendations.*} - Recommendations from agent
   - {dependencies.*} - Dependencies from agent
   - {risks.*} - Risk factors from agent
   - {nextSteps.*} - Next steps from agent

3. Create ticket folder and save the report:
   - Create folder: `.hive/reports/{{arg1}}/`
   - Check if any `triage_*.md` file exists in the folder
   - If exists: Override the existing triage report
   - If not exists: Create new report as: `.hive/reports/{{arg1}}/triage_{{date}}.md`
   - Example: `.hive/reports/HIVE-123/triage_2024-09-26.md`
   - Format: triage_YYYY-MM-DD.md (override if any triage_*.md exists)

## Step 6: Classification-Based Interactive Prompt 🤔

**ONLY if triage analysis and classification were successful:**

**Purpose**: Present classification-aware options based on issue type

### Dynamic Prompt Logic:

The prompt varies based on `issueClassification.primaryCategory`:

---

### **Scenario A: Configuration/Infrastructure/Data/External Service Issue**

**If primaryCategory is one of**: `"Configuration Issue"`, `"Infrastructure Issue"`, `"Data Issue"`, `"External Service Issue"`

**Display**:
```
✅ Triage Analysis Complete!

🔍 Classification: {issueClassification.primaryCategory} ({issueClassification.confidence} Confidence {issueClassification.confidenceScore}%)
📋 Root Cause: {analysis.rootCause}

🛠️ DIAGNOSTIC CHECKLIST AVAILABLE

I've generated {issueClassification.diagnosticChecklist.length} ticket-specific diagnostic steps to verify and fix the {issueClassification.primaryCategory}.

Top Priority Checks:
{for each item in diagnosticChecklist where priority === "Critical", max 3:}
  ✓ {item.step}

📄 See full diagnostic checklist in: .hive/reports/{{arg1}}/triage_{date}.md

💡 {issueClassification.recommendedApproach}
```

**Ask User**:
```javascript
AskUserQuestion({
  questions: [{
    question: "Would you also like me to implement defensive code improvements? (Better error handling, validation, graceful degradation)",
    header: "Code Improvements",
    multiSelect: false,
    options: [
      {
        label: "Yes, add defensive improvements",
        description: "Implement code improvements to handle this scenario gracefully (e.g., better error messages, validation, fallbacks)."
      },
      {
        label: "No, diagnostic checklist is sufficient",
        description: "Focus on fixing the configuration/infrastructure issue. No code changes needed."
      }
    ]
  }]
});
```

**Process Response**:
- **If "Yes, add defensive improvements"**: → Proceed to Step 7 (Code Agent with defensive mode)
- **If "No, checklist is sufficient"**: → Skip to Step 9 (Completion)

---

### **Scenario B: Code Bug**

**If primaryCategory is**: `"Code Bug"`

**Display**:
```
✅ Triage Analysis Complete!

🔍 Classification: Code Bug ({issueClassification.confidence} Confidence {issueClassification.confidenceScore}%)
📋 Root Cause: {analysis.rootCause}
📂 Affected Files: {codeAnalysis.affectedFiles.join(', ')}

💡 {issueClassification.recommendedApproach}

📄 Full Report: .hive/reports/{{arg1}}/triage_{date}.md
```

**Ask User**:
```javascript
AskUserQuestion({
  questions: [{
    question: "Would you like me to implement the bug fix automatically?",
    header: "Code Fix",
    multiSelect: false,
    options: [
      {
        label: "Yes, implement fix now",
        description: "I'll use hive-code-agent to implement the bug fix based on triage analysis."
      },
      {
        label: "No, analysis only",
        description: "Stop here. I'll review the triage report and implement manually."
      }
    ]
  }]
});
```

**Process Response**:
- **If "Yes, implement fix now"**: → Proceed to Step 7 (Code Agent with fix mode)
- **If "No, analysis only"**: → Skip to Step 9 (Completion)

---

### **Scenario C: Hybrid Issue**

**If primaryCategory is**: `"Hybrid"`

**Display**:
```
✅ Triage Analysis Complete!

🔍 Classification: Hybrid Issue
   Primary: {issueClassification.primaryCategory}
   Secondary: {issueClassification.secondaryCategory}
   Confidence: {issueClassification.confidence} ({issueClassification.confidenceScore}%)

📋 Root Cause: {analysis.rootCause}

🎯 MULTI-PHASE APPROACH RECOMMENDED

This issue requires addressing both:
1. {issueClassification.primaryCategory} - Diagnostic checklist provided ({issueClassification.diagnosticChecklist.length} steps)
2. {issueClassification.secondaryCategory} - Code improvements needed

💡 {issueClassification.recommendedApproach}

📄 Full analysis: .hive/reports/{{arg1}}/triage_{date}.md
```

**Ask User**:
```javascript
AskUserQuestion({
  questions: [{
    question: "This is a hybrid issue requiring multiple fixes. What would you like to do?",
    header: "Approach",
    multiSelect: false,
    options: [
      {
        label: `Fix ${issueClassification.primaryCategory} first`,
        description: "Focus on diagnostic checklist for configuration/infrastructure issue first."
      },
      {
        label: `Implement code improvements`,
        description: "Focus on code changes to address code-related aspects."
      },
      {
        label: "Both (checklist + code)",
        description: "I'll provide checklist AND implement code improvements (recommended)."
      },
      {
        label: "Neither (analysis only)",
        description: "Stop here. I'll handle fixes manually."
      }
    ]
  }]
});
```

**Process Response**:
- **If "Fix {primaryCategory} first"**: → Display expanded checklist → Skip to Step 9
- **If "Implement code improvements"**: → Proceed to Step 7 (Code Agent)
- **If "Both"**: → Display checklist + Proceed to Step 7 (Code Agent)
- **If "Neither"**: → Skip to Step 9 (Completion)

---

### **Scenario D: Insufficient Evidence**

**If primaryCategory is**: `"Insufficient Evidence"`

**Display**:
```
⚠️ Triage Analysis Complete (with uncertainty)

🔍 Classification: Insufficient Evidence (Low Confidence {issueClassification.confidenceScore}%)
📋 Findings: {issueClassification.reasoning}

🤔 DEEPER INVESTIGATION RECOMMENDED

The current evidence is not conclusive. Recommended next steps:
{issueClassification.recommendedApproach}

📄 Report: .hive/reports/{{arg1}}/triage_{date}.md
```

**Ask User**:
```javascript
AskUserQuestion({
  questions: [{
    question: "The classification is uncertain. How would you like to proceed?",
    header: "Next Steps",
    multiSelect: false,
    options: [
      {
        label: "Perform deeper investigation",
        description: "Continue investigating to gather more evidence before deciding on fix approach."
      },
      {
        label: "Proceed with best guess",
        description: "Implement fix based on most likely hypothesis despite uncertainty."
      },
      {
        label: "Manual investigation needed",
        description: "Stop here. This requires human analysis."
      }
    ]
  }]
});
```

**Process Response**:
- **If "Perform deeper investigation"**: → Return to Step 3 (more triage analysis)
- **If "Proceed with best guess"**: → Proceed to Step 7 (Code Agent with caution)
- **If "Manual investigation needed"**: → Skip to Step 9 (Completion)

---

### Implementation Notes:

**Context Awareness**:
- Classification result is available in `issueClassification` object
- Use `primaryCategory` to determine which scenario applies
- Include confidence score in all displays for transparency

**User Experience**:
- Always show brief summary first
- Make classification visible (users understand issue type)
- Provide context-appropriate options
- Include report file path for reference

**Error Handling**:
- If classification is missing → Fall back to Scenario B (Code Bug - original behavior)
- If classification fails → Log warning, proceed with default prompt

**Sequential Checkpoint:**
```
✅ Checkpoint: User decision captured
   - Classification-based prompt shown
   - User selection recorded
   - Next action determined (Code Agent / Completion / Further Investigation)
```

## Step 7: Code Implementation (Conditional) 🛠️

**ONLY if user selected "Yes" in Step 6:**

**Use specialized agent for bug fix implementation:**

Use the **Task** tool to launch the **hive-bugfix-plugin:hive-code-agent**:
```
Task:
  subagent_type: "hive-code-agent"
  description: "Implement bug fix for {{arg1}}"
  prompt: "Implement comprehensive bug fix for ticket: {{arg1}}

  Context Available:
  - Ticket details: .hive/reports/{{arg1}}/ticket.md
  - Vision analysis: .hive/reports/{{arg1}}/vision.md (if exists)
  - Triage analysis: .hive/reports/{{arg1}}/triage_*.md (REQUIRED)

  Your Mission:
  1. Read all context files thoroughly (ticket, vision, triage)
  2. Investigate git history for affected files deeply
  3. Explore workspace to understand codebase patterns
  4. Adapt if you discover unexpected situations beyond triage
  5. Implement clean, minimal, well-tested fix
  6. Follow existing code style (learn from git blame)
  7. Add defensive error handling
  8. Document complex logic
  9. Return structured implementation result (JSON format)

  You are an elite software engineer. Trust your professional judgment.
  Triage is guidance, not gospel. Adapt based on what you discover."
```

**Expected Output from Agent:**
```json
{
  "implementationSummary": {
    "ticketId": "{{arg1}}",
    "filesChanged": ["list of files"],
    "linesAdded": 0,
    "linesRemoved": 0,
    "changeType": "fix|refactor|enhancement",
    "complexity": "low|medium|high"
  },
  "changes": {
    "rootCauseFix": {
      "file": "path/to/file",
      "description": "what was fixed",
      "linesChanged": "line range"
    },
    "relatedChanges": []
  },
  "codeQuality": {
    "styleConsistency": "description",
    "errorHandling": "description",
    "documentation": "description",
    "testCoverage": "description"
  },
  "gitContext": {
    "relevantCommits": [],
    "recentAuthors": [],
    "lastModified": "timestamp"
  },
  "adaptiveNotes": [],
  "risks": {
    "breakingChanges": "description",
    "performanceImpact": "description",
    "dependencies": "description"
  },
  "testingRecommendations": [],
  "nextSteps": []
}
```

**Process Agent Result:**
1. If implementation failed:
   - ❌ Display agent's error message
   - Show any partial progress made
   - Exit to Step 9

2. If implementation succeeded:
   - ✅ Continue to Step 8
   - Save implementation result for report generation

## Step 8: Generate Implementation Report (Conditional) 📄

**ONLY if code implementation was successful (Step 7):**

**Orchestrator generates implementation report from agent output:**

1. Use the following markdown template format and fill in ALL the template variables with actual data from implementation result:

```markdown
# 🛠️ Hive Implementation Report

**Generated**: {date}
**Ticket ID**: {ticketId}
**Implemented By**: Hive Code Agent
**Report Version**: 1.0

---

## 📋 Implementation Summary

| Metric | Value |
|--------|-------|
| **Files Changed** | {implementationSummary.filesChanged.length} |
| **Lines Added** | {implementationSummary.linesAdded} |
| **Lines Removed** | {implementationSummary.linesRemoved} |
| **Change Type** | {implementationSummary.changeType} |
| **Complexity** | {implementationSummary.complexity} |

### Files Modified
{list all filesChanged with brief description}

---

## 🔧 Changes Made

### Root Cause Fix

**File**: `{changes.rootCauseFix.file}`
**Lines**: {changes.rootCauseFix.linesChanged}

{changes.rootCauseFix.description}

### Related Changes

{for each relatedChange:}
**{relatedChange.file}**
- Description: {relatedChange.description}
- Reason: {relatedChange.reason}

---

## ✅ Code Quality Assessment

| Aspect | Status |
|--------|--------|
| **Style Consistency** | {codeQuality.styleConsistency} |
| **Error Handling** | {codeQuality.errorHandling} |
| **Documentation** | {codeQuality.documentation} |
| **Test Coverage** | {codeQuality.testCoverage} |

---

## 📚 Git Context Analysis

### Recent Commits
{for each relevantCommit:}
- {relevantCommit}

### Recent Authors
{gitContext.recentAuthors.join(', ')}

### Last Modified
{gitContext.lastModified}

---

## 🎯 Adaptive Intelligence

{if adaptiveNotes.length > 0:}
The agent discovered and handled situations beyond the triage report:
{for each note:}
- {note}
{else:}
Implementation followed triage recommendations directly.

---

## ⚠️ Risk Assessment

### Breaking Changes
{risks.breakingChanges}

### Performance Impact
{risks.performanceImpact}

### Dependencies
{risks.dependencies}

---

## 🧪 Testing Recommendations

### Automated Tests
{for each testRecommendation:}
- {testRecommendation}

### Manual Testing Steps
{provide manual testing guidance}

---

## 📈 Next Steps

{for each nextStep:}
{index}. {nextStep}

---

## 📝 Implementation Summary

This comprehensive implementation addresses the root cause identified in the triage analysis. The code changes follow best practices, maintain consistency with the existing codebase, and include appropriate error handling.

### Key Achievements
- ✅ Root cause fixed
- ✅ Code quality maintained
- ✅ Tests recommended
- ✅ Documentation updated (if needed)

### Deployment Checklist
- [ ] Review code changes
- [ ] Run test suite
- [ ] Manual testing in staging
- [ ] Monitor error logs
- [ ] Deploy to production

---

*Generated by **Hive** - AI-Powered Bug Fix Assistant*
*🖤 Proudly presented by **Blackbird Team***

*Report generated on {date} | For technical questions, contact your development team*
```

2. Replace placeholders with actual data from the implementation result

3. Create implementation report file:
   - Folder: `.hive/reports/{{arg1}}/`
   - Check if any `implementation_*.md` file exists
   - If exists: Override the existing implementation report
   - If not exists: Create new report as: `.hive/reports/{{arg1}}/implementation_{{date}}.md`
   - Example: `.hive/reports/HIVE-123/implementation_2025-01-21.md`
   - Format: implementation_YYYY-MM-DD.md (override if exists)

## Step 9: Final Pipeline Completion 🎯

### If Validation Failed (Early Exit):
- ❌ Ticket not found in Jira
- Display appropriate error message from validation steps
- **DO NOT** proceed to agent analysis
- **DO NOT** generate report file
- **DO NOT** create any folders

### If Agent Analysis Failed:
- ❌ Agent encountered errors during analysis
- Display agent's error message to user
- **DO NOT** generate report file
- **DO NOT** create any folders

### If Triage Successful (Analysis Only):
- ✅ Triage analysis is complete
- ✅ Report file saved to: `.hive/reports/{{arg1}}/triage_{{date}}.md`
- 📁 Provide the exact file path of the generated report
- 📊 Show brief summary of key findings from the analysis
- 💡 Remind: "You can implement the fix later by running this command again and selecting 'Yes' when prompted."

### If Implementation Successful (End-to-End):
- ✅ Triage analysis complete
- ✅ Bug fix implemented
- ✅ Triage report saved: `.hive/reports/{{arg1}}/triage_{{date}}.md`
- ✅ Implementation report saved: `.hive/reports/{{arg1}}/implementation_{{date}}.md`
- 📁 Provide paths to both reports
- 📊 Show implementation summary:
  - Files changed: {count}
  - Lines added: {count}
  - Lines removed: {count}
  - Change type: {type}
- ✅ Provide next steps for testing and deployment

## Template Variable Mapping
The enhanced analysis (from orchestrator review in Step 4) provides structured data that maps to template variables as follows:

```
Enhanced Analysis Structure → Template Variables:
- ticketDetails: {id, summary, status, priority, reporter, assignee}
- analysis: {rootCause, businessImpact, userImpact, technicalImpact, severity, urgency, riskLevel}
- recommendations: {immediateActions, solutionApproach, storyPoints, timeEstimate, confidence}
- dependencies: {relatedIssues, blockers}
- risks: {factors}
- nextSteps: {actions}
- orchestratorReview: {reviewDate, validationStatus, correctionsM ade, additionalFindings, alternativeCauses, confidenceAdjustment, validationNotes}
```

**This is an orchestrated multi-agent pipeline with quality control and optional implementation:**
```
Input Validation
  ↓
[Task] jira-validation-agent → Validation result + ticket.md
  ↓
[Task] vision-agent (if images) → vision.md
  ↓
[Task] triage-agent (reads ticket.md + vision.md) → Analysis result
  ↓
[Orchestrator] Senior Review & Validation → Enhanced analysis
  ↓
Generate triage report → triage.md
  ↓
[Interactive] Ask User: Implement fix? (y/n)
  ├─→ YES:
  │    ↓
  │   [Task] hive-code-agent → Implementation result
  │    ↓
  │   Generate implementation report → implementation.md
  │    ↓
  │   Complete (Analysis + Fix)
  │
  └─→ NO:
       ↓
      Complete (Analysis Only)
```

**Data Flow**:
- Validation agent creates: `ticket.md` (all ticket info)
- Vision agent creates: `vision.md` (visual analysis)
- Triage agent reads: `ticket.md` + `vision.md` → Performs code investigation
- **Orchestrator reviews**: Agent analysis → Validates, investigates alternatives, enhances
- Orchestrator generates: `triage.md` (final report with review)
- **Interactive decision**: User chooses whether to implement fix
- **Conditional**: If YES → Code agent implements → `implementation.md` created
- **Conditional**: If NO → Stop (analysis only)

## 🏗️ Architecture Benefits

### Context Efficiency:
- ✅ Each sub-agent runs in isolated context
- ✅ Main orchestrator maintains minimal context
- ✅ No context overflow issues

### Modularity:
- ✅ Single responsibility per agent
- ✅ Agents are reusable and testable
- ✅ Clear separation of concerns

### Scalability:
- ✅ Easy to add new specialized agents
- ✅ Parallel execution possible (future)
- ✅ Independent agent development

### Quality Assurance:
- ✅ Orchestrator senior review layer
- ✅ Alternative causes investigation
- ✅ Validation and correction before reporting
- ✅ Higher confidence in findings

### Debugging:
- ✅ Each agent output is traceable
- ✅ Clear error boundaries
- ✅ Easy to identify failures

## 📋 Agent & Orchestrator Responsibilities

| Stage | Role | Responsibility | Input | Output |
|-------|------|---------------|-------|--------|
| **Step 1** | jira-validation-agent | Ticket validation + Data collection | Ticket ID | JSON validation + `ticket.md` |
| **Step 2** | vision-agent | Pure visual analysis | Ticket ID | `vision.md` |
| **Step 3** | triage-agent | Code investigation & initial analysis | ticket.md + vision.md | Structured analysis |
| **Step 4** | Main Orchestrator | Senior review & validation (Quality Control) | Agent analysis | Enhanced/corrected analysis |
| **Step 5** | Main Orchestrator | Triage report generation | Enhanced analysis | `triage.md` |
| **Step 6** | Main Orchestrator | Interactive user prompt | Triage complete | User decision (y/n) |
| **Step 7** | hive-code-agent | Bug fix implementation (conditional) | ticket.md + vision.md + triage.md | Implementation result (JSON) |
| **Step 8** | Main Orchestrator | Implementation report generation (conditional) | Implementation result | `implementation.md` |
| **Step 9** | Main Orchestrator | Final pipeline completion | All results | Status message + paths |

**Performance Optimization**:
- Validation agent fetches ticket data once and saves to `ticket.md`
- Triage agent reads from file (no duplicate Jira API calls)
- Orchestrator review adds quality control without context overflow
- Code agent only runs if user requests (optional)
- Faster analysis, less MCP overhead, higher accuracy
- User control prevents unwanted code changes

**User Experience**:
- Single command for entire workflow
- Interactive decision point (user control)
- Flexible: analysis-only OR end-to-end fix
- No separate commands to remember
- Clear progress and status updates