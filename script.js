/* =========================================================
   CIVICMESH
   CM-0142
   RESPONSE PLANNER + ACTION CENTER
========================================================= */


/* =========================
   STATE
========================= */

let incidentApproved = false;
let reportCount = 7;
let pipelineRunning = false;
let planRunning = false;


/* =========================
   AGENTS
========================= */

const agents = [
    {
        name: "Intake Agent",
        title: "Normalizing citizen reports",
        description:
            "Converting fragmented observations into structured incident data.",
        result: "7 raw observations normalized",
        audit: "Citizen reports normalized."
    },

    {
        name: "Evidence Agent",
        title: "Extracting evidence",
        description:
            "Identifying road damage, water accumulation and vehicle-safety clues.",
        result: "Evidence signals extracted",
        audit: "Road hazard evidence extracted."
    },

    {
        name: "Incident Fusion Agent",
        title: "Finding related reports",
        description:
            "Comparing semantic, geographic and contextual signals.",
        result: "7 reports → 1 probable incident",
        audit: "7 reports fused into CM-0142."
    },

    {
        name: "Priority Agent",
        title: "Assessing incident risk",
        description:
            "Applying transparent risk criteria to determine operational priority.",
        result: "Priority: HIGH • 82/100",
        audit: "Priority assigned: High."
    },

    {
        name: "Routing Agent",
        title: "Determining responsible function",
        description:
            "Mapping issue type and location to a civic function.",
        result: "Road Maintenance • 96%",
        audit: "Recommended Road Maintenance."
    },

    {
        name: "Response Planner",
        title: "Building response sequence",
        description:
            "Creating a reviewable sequence of recommended response steps.",
        result: "Response plan generated",
        audit: "Response plan generated."
    },

    {
        name: "Review Agent",
        title: "Checking consistency",
        description:
            "Validating evidence, confidence and action readiness.",
        result: "Human approval required",
        audit: "Incident ready for human approval."
    }
];


/* =========================
   NAVIGATION
========================= */

function goDashboard() {

    window.location.href = "dashboard.html";

}


function scrollToAgents() {

    document
        .getElementById("agentNetwork")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


function scrollToEvidence() {

    document
        .getElementById("evidencePanel")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


function scrollToReview() {

    document
        .getElementById("reviewPanel")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


/* =========================
   AGENT PIPELINE
========================= */

async function runAgentPipeline() {

    if (pipelineRunning) {
        return;
    }

    pipelineRunning = true;

    incidentApproved = false;

    const button =
        document.getElementById("pipelineButton");

    if (button) {

        button.innerHTML =
            "<span>◌</span> Running Agents...";

        button.disabled = true;

        button.style.color = "";
        button.style.borderColor = "";
        button.style.background = "";

    }


    resetAgents();


    const orb =
        document.querySelector(".context-orb");

    orb?.classList.add("running");


    for (
        let i = 0;
        i < agents.length;
        i++
    ) {

        await activateAgent(i);

    }


    orb?.classList.remove("running");


    pipelineRunning = false;


    if (button) {

        button.innerHTML =
            "<span>✓</span> Awaiting Human Review";

        button.style.color =
            "var(--cyan)";

        button.style.borderColor =
            "rgba(25,200,255,0.3)";

        button.style.background =
            "rgba(25,200,255,0.06)";

        button.disabled = false;

    }


    updateAgentContext(
        "CivicMesh pipeline complete",
        "CM-0142 has passed through all seven specialized agents and is ready for human review.",
        7
    );


    updatePipelineReviewStep(false);


    updateAgentNetworkState(false);


    showToast(
        "Agent pipeline complete",
        "7 agents processed CM-0142 successfully."
    );

}


async function activateAgent(index) {

    const cards =
        document.querySelectorAll(".agent-card");

    const connectors =
        document.querySelectorAll(".agent-connector");


    const card =
        cards[index];

    if (!card) {
        return;
    }


    card.classList.add("active");


    const state =
        card.querySelector(".agent-state");


    if (state) {

        state.textContent =
            "PROCESSING";

    }


    updateAgentContext(
        agents[index].title,
        agents[index].description,
        index + 1
    );


    await sleep(
        index === 2
            ? 1600
            : 1000
    );


    card.classList.remove("active");

    card.classList.add("complete");


    if (state) {

        state.textContent =
            "COMPLETE";

    }


    if (index < connectors.length) {

        const connector =
            connectors[index];

        connector.classList.add(
            "flowing"
        );

        await sleep(450);

        connector.classList.remove(
            "flowing"
        );

        connector.classList.add(
            "done"
        );

    }


    addAuditEntry(
        agents[index].name,
        agents[index].audit
    );


    updateAgentContext(
        agents[index].name,
        agents[index].result,
        index + 1
    );

}


function resetAgents() {

    document
        .querySelectorAll(".agent-card")
        .forEach(card => {

            card.classList.remove(
                "active",
                "complete"
            );


            const state =
                card.querySelector(
                    ".agent-state"
                );


            if (state) {

                state.textContent =
                    "READY";

            }

        });


    document
        .querySelectorAll(
            ".agent-connector"
        )
        .forEach(connector => {

            connector.classList.remove(
                "flowing",
                "done"
            );

        });


    updateAgentContext(
        "Awaiting pipeline execution",
        "Run the pipeline to watch CM-0142 move through the CivicMesh reasoning system.",
        0
    );


    updatePipelineReviewStep(false);

}


function updateAgentContext(
    title,
    description,
    progress
) {

    const titleElement =
        document.getElementById(
            "agentActivityTitle"
        );


    const textElement =
        document.getElementById(
            "agentActivityText"
        );


    const numberElement =
        document.getElementById(
            "agentProgressNumber"
        );


    const progressBar =
        document.getElementById(
            "agentProgressBar"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (textElement) {

        textElement.textContent =
            description;

    }


    if (numberElement) {

        numberElement.textContent =
            progress;

    }


    if (progressBar) {

        progressBar.style.width =
            `${(progress / 7) * 100}%`;

    }

}


/* =========================
   PIPELINE STATUS STRIP
========================= */

function updatePipelineReviewStep(
    approved = false
) {

    const steps =
        document.querySelectorAll(
            ".status-step"
        );


    if (!steps.length) {
        return;
    }


    /* STEP 01–05 */

    steps.forEach(
        (step, index) => {

            if (index < 5) {

                step.classList.remove(
                    "active"
                );

                step.classList.add(
                    "complete"
                );


                const icon =
                    step.querySelector(
                        ".step-icon"
                    );


                const small =
                    step.querySelector(
                        "small"
                    );


                if (icon) {

                    icon.textContent =
                        "✓";

                }


                if (small) {

                    small.textContent =
                        String(
                            index + 1
                        ).padStart(2, "0");

                }

            }

        }
    );


    /* STEP 06 — PLAN */

    const planStep =
        steps[5];


    if (planStep) {

        planStep.classList.remove(
            "active"
        );

        planStep.classList.add(
            "complete"
        );


        const icon =
            planStep.querySelector(
                ".step-icon"
            );


        const small =
            planStep.querySelector(
                "small"
            );


        if (icon) {

            icon.textContent =
                "✓";

        }


        if (small) {

            small.textContent =
                "06";

        }

    }


    /* STEP 07 — REVIEW */

    const reviewStep =
        steps[6];


    if (reviewStep) {

        reviewStep.classList.remove(
            "active"
        );

        reviewStep.classList.add(
            "complete"
        );


        const icon =
            reviewStep.querySelector(
                ".step-icon"
            );


        const small =
            reviewStep.querySelector(
                "small"
            );


        if (icon) {

            icon.textContent =
                "✓";

        }


        if (small) {

            small.textContent =
                approved
                    ? "APPROVED"
                    : "DONE";

        }

    }


    /* CONNECTORS */

    document
        .querySelectorAll(
            ".status-line"
        )
        .forEach(line => {

            line.classList.remove(
                "active-line"
            );

            line.classList.add(
                "complete"
            );

        });

}


/* =========================
   AGENT NETWORK STATE
========================= */

function updateAgentNetworkState(
    approved
) {

    const networkButton =
        document.querySelector(
            ".agent-network-header .pipeline-btn"
        );


    if (!networkButton) {
        return;
    }


    if (approved) {

        networkButton.innerHTML =
            "<span>✓</span> Human Review Approved";

        networkButton.style.color =
            "var(--green)";

        networkButton.style.borderColor =
            "rgba(66,229,154,0.35)";

        networkButton.style.background =
            "rgba(66,229,154,0.08)";

    } else {

        networkButton.innerHTML =
            "<span>✓</span> Awaiting Human Review";

        networkButton.style.color =
            "";

        networkButton.style.borderColor =
            "";

        networkButton.style.background =
            "";

    }

}


/* =========================
   RESPONSE PLAN
========================= */

async function runResponsePlan() {

    if (planRunning) {
        return;
    }


    planRunning = true;


    const button =
        document.getElementById(
            "executePlanButton"
        );


    const status =
        document.getElementById(
            "plannerStatus"
        );


    if (button) {

        button.classList.add(
            "running"
        );

        button.textContent =
            "◌ Simulating Response Plan...";

        button.disabled = true;

    }


    if (status) {

        status.textContent =
            "PLAN EXECUTING";

        status.style.color =
            "var(--cyan)";

    }


    const actions =
        document.querySelectorAll(
            ".action-item"
        );


    for (
        let i = 1;
        i < actions.length;
        i++
    ) {

        const action =
            actions[i];


        action.classList.add(
            "executing"
        );


        const state =
            action.querySelector(
                ".action-top span"
            );


        if (state) {

            state.textContent =
                "PROCESSING";

        }


        await sleep(1100);


        action.classList.remove(
            "executing"
        );


        action.classList.add(
            "completed"
        );


        const marker =
            action.querySelector(
                ".action-marker span"
            );


        if (marker) {

            marker.textContent =
                "✓";

        }


        if (state) {

            state.textContent =
                "READY";

        }

    }


    planRunning = false;


    if (button) {

        button.classList.remove(
            "running"
        );

        button.classList.add(
            "complete"
        );

        button.textContent =
            "✓ Response Plan Simulated";

        button.disabled =
            false;

    }


    if (status) {

        status.textContent =
            "PLAN READY FOR REVIEW";

        status.style.color =
            "var(--green)";

    }


    addAuditEntry(
        "Response Planner",
        "Response sequence simulated and prepared for review."
    );


    showToast(
        "Response plan ready",
        "The recommended sequence is ready for human review."
    );

}


/* =========================
   AUDIT
========================= */

function addAuditEntry(
    name,
    description
) {

    const list =
        document.getElementById(
            "auditList"
        );


    if (!list) {
        return;
    }


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "audit-item pipeline-audit";


    item.innerHTML = `

        <span
            class="audit-dot"
            style="background: var(--green)">
        </span>

        <div>

            <strong>
                ${name}
            </strong>

            <p>
                ${description}
            </p>

        </div>

        <time>
            NOW
        </time>

    `;


    list.insertBefore(
        item,
        list.firstChild
    );

}


/* =========================
   APPROVAL
========================= */

function approveIncident() {

    if (incidentApproved) {

        showToast(
            "Already approved",
            "CM-0142 has already passed human review."
        );

        return;

    }


    openModal(
        "approvalModal"
    );

}


function confirmApproval() {

    incidentApproved = true;


    closeModal(
        "approvalModal"
    );


    /* REVIEW PANEL */

    const label =
        document.querySelector(
            "#reviewPanel .section-label"
        );


    const title =
        document.querySelector(
            "#reviewPanel h2"
        );


    const paragraph =
        document.querySelector(
            "#reviewPanel p"
        );


    const button =
        document.getElementById(
            "finalApproveButton"
        );


    if (label) {

        label.textContent =
            "HUMAN APPROVAL COMPLETE";

    }


    if (title) {

        title.textContent =
            "Response approved";

    }


    if (paragraph) {

        paragraph.textContent =
            "The operator approved the recommended response sequence. No external action is automatically dispatched by this demo.";

    }


    if (button) {

        button.textContent =
            "✓ Response Approved";

        button.disabled =
            true;

        button.style.opacity =
            "0.65";

    }


    /* TOP INCIDENT BUTTON */

    const topApproveButton =
        document.querySelector(
            ".incident-actions .primary-btn"
        );


    if (topApproveButton) {

        topApproveButton.textContent =
            "✓ Response Approved";

        topApproveButton.disabled =
            true;

        topApproveButton.style.opacity =
            "0.65";

        topApproveButton.style.background =
            "rgba(66,229,154,0.08)";

        topApproveButton.style.borderColor =
            "rgba(66,229,154,0.35)";

        topApproveButton.style.color =
            "var(--green)";

    }


    /* REVIEW AUDIT */

    const waitingAudit =
        document.getElementById(
            "reviewAudit"
        );


    if (waitingAudit) {

        waitingAudit.classList.remove(
            "waiting"
        );

        waitingAudit.classList.add(
            "approved"
        );


        const text =
            waitingAudit.querySelector(
                "p"
            );


        if (text) {

            text.textContent =
                "Human approval recorded";

        }

    }


    /* REVIEW AGENT CARD */

    const reviewCard =
        document.querySelector(
            '.agent-card[data-agent="6"]'
        );


    if (reviewCard) {

        reviewCard.classList.remove(
            "active"
        );

        reviewCard.classList.add(
            "complete"
        );


        const reviewState =
            reviewCard.querySelector(
                ".agent-state"
            );


        if (reviewState) {

            reviewState.textContent =
                "APPROVED";

        }

    }


    /* STATUS STRIP */

    updatePipelineReviewStep(
        true
    );


    /* AGENT NETWORK */

    updateAgentNetworkState(
        true
    );


    /* LIVE CONTEXT */

    updateAgentContext(
        "Human approval complete",
        "CM-0142 has passed the final human decision gate. The recommended response is approved for this demo.",
        7
    );


    /* AUDIT */

    addAuditEntry(
        "Human Operator",
        "Approved recommended response for CM-0142."
    );


    /* TOAST */

    showToast(
        "Response approved",
        "CM-0142 has passed the human decision gate."
    );

}


function rejectIncident() {

    showToast(
        "Review requested",
        "The response has been returned for additional verification."
    );

}


/* =========================
   REPORTS
========================= */

function openReportModal() {

    openModal(
        "reportModal"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "newReport"
                )
                ?.focus();

        },
        200
    );

}


function addReport() {

    const textarea =
        document.getElementById(
            "newReport"
        );


    if (!textarea) {
        return;
    }


    const value =
        textarea.value.trim();


    if (!value) {

        showToast(
            "Observation required",
            "Enter a citizen observation before adding it."
        );

        textarea.focus();

        return;

    }


    reportCount++;


    const reportFact =
        document.getElementById(
            "reportFact"
        );


    if (reportFact) {

        reportFact.textContent =
            `${reportCount} related`;

    }


    const reportsTitle =
        document.getElementById(
            "reportsTitle"
        );


    if (reportsTitle) {

        reportsTitle.textContent =
            `${reportCount} reports fused into this incident`;

    }


    textarea.value =
        "";


    closeModal(
        "reportModal"
    );


    showToast(
        "Report analyzed",
        "The new observation is consistent with CM-0142."
    );

}


function showAllReports() {

    showToast(
        "Evidence cluster",
        `${reportCount} source observations currently support CM-0142.`
    );

}


/* =========================
   MODALS
========================= */

function openModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

            document.body.style.overflow =
                "";

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(
                    modal => {

                        modal.classList.remove(
                            "show"
                        );

                    }
                );


            document.body.style.overflow =
                "";

        }

    }
);


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(
    title,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const titleElement =
        document.getElementById(
            "toastTitle"
        );


    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {
        return;
    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================
   REFRESH
========================= */

function refreshIncident() {

    const button =
        document.querySelector(
            ".icon-button"
        );


    if (button) {

        button.style.transform =
            "rotate(360deg)";

    }


    setTimeout(
        () => {

            if (button) {

                button.style.transform =
                    "";

            }

        },
        500
    );


    showToast(
        "Incident refreshed",
        "CM-0142 evidence and agent state are up to date."
    );

}


/* =========================
   MAP CONTROLS
========================= */

document
    .querySelectorAll(
        ".map-controls button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const map =
                        document.querySelector(
                            ".map"
                        );


                    map?.animate(
                        [
                            {
                                transform:
                                    "scale(1)"
                            },

                            {
                                transform:
                                    "scale(1.015)"
                            },

                            {
                                transform:
                                    "scale(1)"
                            }

                        ],
                        {
                            duration: 250
                        }
                    );

                }
            );

        }
    );


/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.matches(
                "textarea,input"
            )
        ) {

            return;

        }


        if (
            event.key.toLowerCase() === "a"
        ) {

            approveIncident();

        }


        if (
            event.key.toLowerCase() === "r"
        ) {

            openReportModal();

        }


        if (
            event.key.toLowerCase() === "p"
        ) {

            runAgentPipeline();

        }


        if (
            event.key.toLowerCase() === "x"
        ) {

            runResponsePlan();

        }

    }
);


/* =========================
   UTILITY
========================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================
   INITIAL LOAD
========================= */

window.addEventListener(
    "load",
    () => {

        document
            .querySelectorAll(
                ".panel,.planner-section,.review-section"
            )
            .forEach(
                (element, index) => {

                    element.style.opacity =
                        "0";

                    element.style.transform =
                        "translateY(8px)";


                    setTimeout(
                        () => {

                            element.style.transition =
                                "opacity .35s ease, transform .35s ease";

                            element.style.opacity =
                                "1";

                            element.style.transform =
                                "translateY(0)";

                        },
                        60 + index * 25
                    );

                }
            );

    }
);