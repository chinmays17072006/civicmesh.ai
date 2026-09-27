/* =========================================================
   CIVICMESH
   COMMAND CENTER
   DASHBOARD INTERACTION ENGINE
========================================================= */


/* =========================================================
   STATE
========================================================= */

let miniPipelineRunning = false;
let dashboardRefreshing = false;

const demoAgents = [
    {
        code: "IN",
        name: "Intake Agent",
        action: "Normalizing citizen reports",
        result: "7 observations structured"
    },

    {
        code: "EV",
        name: "Evidence Agent",
        action: "Extracting evidence signals",
        result: "Road + safety evidence extracted"
    },

    {
        code: "FX",
        name: "Fusion Agent",
        action: "Finding related reports",
        result: "7 reports → 1 probable incident"
    },

    {
        code: "PR",
        name: "Priority Agent",
        action: "Assessing operational risk",
        result: "Priority HIGH • 82/100"
    },

    {
        code: "RT",
        name: "Routing Agent",
        action: "Determining civic function",
        result: "Road Maintenance • 96%"
    },

    {
        code: "PL",
        name: "Response Planner",
        action: "Building response sequence",
        result: "Reviewable response plan generated"
    },

    {
        code: "RV",
        name: "Review Agent",
        action: "Checking consistency",
        result: "Human approval required"
    }
];


/* =========================================================
   NAVIGATION
========================================================= */

function openIncident(id) {

    if (!id) {
        id = "CM-0142";
    }

    if (id === "CM-0142") {

        window.location.href = "index.html";

        return;
    }

    showToast(
        "Demo incident",
        `${id} is available as synthetic demonstration data.`
    );
}


function scrollToSection(id) {

    const section =
        document.getElementById(id);

    if (!section) {
        return;
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    setTimeout(() => {

        section.classList.add("section-focus");

        setTimeout(() => {

            section.classList.remove(
                "section-focus"
            );

        }, 1200);

    }, 500);
}


/* =========================================================
   INCIDENT FILTERS
========================================================= */

function filterIncidents(
    priority,
    button
) {

    const cards =
        document.querySelectorAll(
            ".incident-card"
        );


    document
        .querySelectorAll(".filter")
        .forEach(filter => {

            filter.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    cards.forEach(card => {

        const cardPriority =
            card.dataset.priority;


        if (
            priority === "all" ||
            cardPriority === priority
        ) {

            card.style.display =
                "";

            requestAnimationFrame(() => {

                card.style.opacity =
                    "1";

                card.style.transform =
                    "translateY(0)";

            });

        } else {

            card.style.opacity =
                "0";

            card.style.transform =
                "translateY(6px)";

            setTimeout(() => {

                card.style.display =
                    "none";

            }, 180);

        }

    });


    const label =
        priority === "all"
            ? "All incidents"
            : `${capitalize(priority)} priority incidents`;


    showToast(
        "Incident filter",
        label
    );

}


/* =========================================================
   MINI AGENT PIPELINE
========================================================= */

async function runMiniPipeline() {

    if (miniPipelineRunning) {
        return;
    }


    miniPipelineRunning = true;


    const button =
        document.querySelector(
            ".pipeline-demo"
        );


    const message =
        document.getElementById(
            "pipelineMessage"
        );


    const agents =
        document.querySelectorAll(
            ".network-agent"
        );


    const healthRows =
        document.querySelectorAll(
            ".health-row"
        );


    /* -----------------------------------------
       PREPARE
    ----------------------------------------- */

    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            "◌ Running Demo...";

    }


    if (message) {

        message.innerHTML = `
            <span class="pipeline-dot active"></span>
            CivicMesh is processing CM-0142 through seven specialized agents...
        `;

    }


    resetMiniPipelineVisuals();


    showToast(
        "Agent demo started",
        "CM-0142 is moving through the CivicMesh reasoning pipeline."
    );


    /* -----------------------------------------
       PROCESS EACH AGENT
    ----------------------------------------- */

    for (
        let i = 0;
        i < demoAgents.length;
        i++
    ) {

        await activateMiniAgent(
            i,
            agents,
            healthRows
        );

    }


    /* -----------------------------------------
       COMPLETE
    ----------------------------------------- */

    if (message) {

        message.innerHTML = `
            <span class="pipeline-dot complete"></span>
            Pipeline complete — CM-0142 is ready for human review.
        `;

    }


    if (button) {

        button.disabled =
            false;

        button.innerHTML =
            "✓ Demo Complete";

        button.style.color =
            "var(--green)";

        button.style.borderColor =
            "rgba(66,229,154,0.35)";

        button.style.background =
            "rgba(66,229,154,0.08)";


        setTimeout(() => {

            button.innerHTML =
                "▶ Run Demo";

            button.style.color =
                "";

            button.style.borderColor =
                "";

            button.style.background =
                "";

        }, 3500);

    }


    miniPipelineRunning =
        false;


    updateDashboardAfterPipeline();


    showToast(
        "Pipeline complete",
        "7 agents processed CM-0142 successfully."
    );

}


/* =========================================================
   ACTIVATE MINI AGENT
========================================================= */

async function activateMiniAgent(
    index,
    agents,
    healthRows
) {

    const data =
        demoAgents[index];


    const networkAgent =
        agents[index];


    const healthRow =
        healthRows[index];


    /* -----------------------------------------
       NETWORK AGENT ACTIVE
    ----------------------------------------- */

    if (networkAgent) {

        networkAgent.classList.add(
            "active"
        );

        networkAgent.style.transform =
            "translateY(-5px)";

        networkAgent.style.borderColor =
            "rgba(25,200,255,0.75)";

        networkAgent.style.boxShadow =
            "0 0 28px rgba(25,200,255,0.22)";

    }


    /* -----------------------------------------
       HEALTH ROW ACTIVE
    ----------------------------------------- */

    if (healthRow) {

        healthRow.classList.add(
            "active-agent"
        );


        const info =
            healthRow.querySelector(
                ".health-info span"
            );


        const state =
            healthRow.querySelector(
                ".health-state"
            );


        if (info) {

            info.textContent =
                "Processing";

        }


        if (state) {

            state.className =
                "health-state processing";

            state.textContent =
                "●";

        }

    }


    /* -----------------------------------------
       SPECIAL FUSION STATE
    ----------------------------------------- */

    if (data.code === "FX") {

        highlightFusionSection(
            true
        );

    }


    updatePipelineMessage(
        data.name,
        data.action,
        index + 1
    );


    await sleep(
        data.code === "FX"
            ? 1500
            : 750
    );


    /* -----------------------------------------
       COMPLETE
    ----------------------------------------- */

    if (networkAgent) {

        networkAgent.classList.remove(
            "active"
        );

        networkAgent.classList.add(
            "complete"
        );

        networkAgent.style.transform =
            "translateY(0)";

        networkAgent.style.borderColor =
            "rgba(66,229,154,0.45)";

        networkAgent.style.boxShadow =
            "0 0 20px rgba(66,229,154,0.12)";

    }


    if (healthRow) {

        const info =
            healthRow.querySelector(
                ".health-info span"
            );


        const state =
            healthRow.querySelector(
                ".health-state"
            );


        if (info) {

            info.textContent =
                "Complete";

        }


        if (state) {

            state.className =
                "health-state online";

            state.textContent =
                "●";

        }

    }


    if (data.code === "FX") {

        highlightFusionSection(
            false
        );

        animateFusionVisual();

    }


    updatePipelineMessage(
        data.name,
        data.result,
        index + 1
    );


    await sleep(250);

}


/* =========================================================
   PIPELINE MESSAGE
========================================================= */

function updatePipelineMessage(
    agentName,
    text,
    progress
) {

    const message =
        document.getElementById(
            "pipelineMessage"
        );


    if (!message) {
        return;
    }


    message.innerHTML = `

        <span class="pipeline-dot active"></span>

        <strong>
            ${String(progress).padStart(2, "0")}/07
            ${agentName}
        </strong>

        <span>
            ${text}
        </span>

    `;

}


/* =========================================================
   RESET MINI PIPELINE
========================================================= */

function resetMiniPipelineVisuals() {

    document
        .querySelectorAll(
            ".network-agent"
        )
        .forEach(agent => {

            agent.classList.remove(
                "active",
                "complete"
            );


            agent.style.transform =
                "";

            agent.style.borderColor =
                "";

            agent.style.boxShadow =
                "";

        });


    document
        .querySelectorAll(
            ".health-row"
        )
        .forEach(row => {

            row.classList.remove(
                "active-agent"
            );


            const info =
                row.querySelector(
                    ".health-info span"
                );


            const state =
                row.querySelector(
                    ".health-state"
                );


            if (info) {

                info.textContent =
                    "Available";

            }


            if (state) {

                state.className =
                    "health-state online";

                state.textContent =
                    "●";

            }

        });


    highlightFusionSection(
        false
    );

}


/* =========================================================
   FUSION VISUAL
========================================================= */

function highlightFusionSection(
    active
) {

    const fusion =
        document.querySelector(
            ".fusion-engine"
        );


    const core =
        document.querySelector(
            ".fusion-core"
        );


    if (!fusion) {
        return;
    }


    if (active) {

        fusion.style.transform =
            "scale(1.08)";

        fusion.style.filter =
            "drop-shadow(0 0 20px rgba(25,200,255,0.55))";

        if (core) {

            core.style.boxShadow =
                "0 0 35px rgba(25,200,255,0.55)";

        }

    } else {

        fusion.style.transform =
            "";

        fusion.style.filter =
            "";

        if (core) {

            core.style.boxShadow =
                "";

        }

    }

}


function animateFusionVisual() {

    const sourceReports =
        document.querySelectorAll(
            ".source-report"
        );


    sourceReports.forEach(
        (report, index) => {

            setTimeout(() => {

                report.style.transform =
                    "translateX(8px)";

                report.style.borderColor =
                    "rgba(25,200,255,0.45)";

                setTimeout(() => {

                    report.style.transform =
                        "";

                }, 300);

            }, index * 100);

        }
    );


    const result =
        document.querySelector(
            ".result-incident"
        );


    if (result) {

        result.style.transform =
            "scale(1.04)";

        result.style.borderColor =
            "rgba(66,229,154,0.55)";


        setTimeout(() => {

            result.style.transform =
                "";

        }, 700);

    }

}


/* =========================================================
   DASHBOARD COMPLETION STATE
========================================================= */

function updateDashboardAfterPipeline() {

    const activityList =
        document.querySelector(
            ".activity-list"
        );


    if (activityList) {

        const existing =
            activityList.querySelector(
                ".demo-activity"
            );


        if (!existing) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "activity-item demo-activity";


            item.innerHTML = `

                <span class="activity-line"></span>

                <div>

                    <strong>
                        Review Agent
                    </strong>

                    <p>
                        CM-0142 ready for human approval
                    </p>

                </div>

                <time>
                    NOW
                </time>

            `;


            activityList.insertBefore(
                item,
                activityList.firstChild
            );

        }

    }


    /* Update featured incident flow */

    const featured =
        document.querySelector(
            ".incident-card.featured"
        );


    if (featured) {

        const activeAgent =
            featured.querySelector(
                ".mini-agent-flow .active"
            );


        if (activeAgent) {

            activeAgent.classList.remove(
                "active"
            );

            activeAgent.classList.add(
                "done"
            );

        }


        const review =
            featured.querySelector(
                ".mini-agent-flow span:last-child"
            );


        if (review) {

            review.classList.add(
                "active"
            );

        }


        const status =
            featured.querySelector(
                ".incident-card-footer strong"
            );


        if (status) {

            status.textContent =
                "REVIEW →";

        }

    }

}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

function refreshDashboard() {

    if (dashboardRefreshing) {
        return;
    }


    dashboardRefreshing =
        true;


    const button =
        document.querySelector(
            ".refresh-button"
        );


    if (button) {

        button.style.transform =
            "rotate(360deg)";

        button.style.transition =
            "transform .6s ease";

    }


    showToast(
        "Refreshing Command Center",
        "Refreshing incident, evidence and agent status."
    );


    animateKpis();


    setTimeout(() => {

        if (button) {

            button.style.transform =
                "";

        }


        dashboardRefreshing =
            false;


        showToast(
            "Command Center updated",
            "Synthetic civic data is synchronized."
        );

    }, 800);

}


/* =========================================================
   KPI ANIMATION
========================================================= */

function animateKpis() {

    document
        .querySelectorAll(
            ".kpi-card"
        )
        .forEach(
            (card, index) => {

                card.style.transform =
                    "translateY(-4px)";


                card.style.transition =
                    "transform .25s ease";


                setTimeout(() => {

                    card.style.transform =
                        "";

                }, 250 + index * 70);

            }
        );

}


/* =========================================================
   TOAST
========================================================= */

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
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3500);

}


/* =========================================================
   INITIAL DASHBOARD STATE
========================================================= */

function initializeDashboard() {

    /* -----------------------------------------
       Incident cards
    ----------------------------------------- */

    document
        .querySelectorAll(
            ".incident-card"
        )
        .forEach(
            (card, index) => {

                card.style.opacity =
                    "0";

                card.style.transform =
                    "translateY(8px)";


                setTimeout(() => {

                    card.style.transition =
                        "opacity .35s ease, transform .35s ease";

                    card.style.opacity =
                        "1";

                    card.style.transform =
                        "translateY(0)";

                }, 100 + index * 80);

            }
        );


    /* -----------------------------------------
       KPI cards
    ----------------------------------------- */

    document
        .querySelectorAll(
            ".kpi-card"
        )
        .forEach(
            (card, index) => {

                card.style.opacity =
                    "0";

                card.style.transform =
                    "translateY(8px)";


                setTimeout(() => {

                    card.style.transition =
                        "opacity .4s ease, transform .4s ease";

                    card.style.opacity =
                        "1";

                    card.style.transform =
                        "translateY(0)";

                }, 50 + index * 80);

            }
        );


    /* -----------------------------------------
       System status
    ----------------------------------------- */

    const message =
        document.getElementById(
            "pipelineMessage"
        );


    if (message) {

        message.innerHTML = `

            <span class="pipeline-dot"></span>

            System ready — awaiting demonstration.

        `;

    }

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.matches(
                "input, textarea, button"
            )
        ) {

            return;

        }


        /* D = run dashboard demo */

        if (
            event.key.toLowerCase() === "d"
        ) {

            runMiniPipeline();

        }


        /* I = open CM-0142 */

        if (
            event.key.toLowerCase() === "i"
        ) {

            openIncident(
                "CM-0142"
            );

        }


        /* R = refresh */

        if (
            event.key.toLowerCase() === "r"
        ) {

            refreshDashboard();

        }

    }
);


/* =========================================================
   UTILITIES
========================================================= */

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}




/* =========================================================
   HACKATHON: DEMO AUTH + CITIZEN REPORT WORKFLOW
   ========================================================= */
const CM_API = "http://127.0.0.1:8000";
const CM_DEMO_USER = {
    email: "operator@civicmesh.ai",
    password: "CivicMesh@2026",
    name: "CivicMesh Operator",
    role: "Human Review Operator"
};

function cmUpdateOperatorUI(user){
    if(!user) return;
    const strong=document.querySelector(".operator strong");
    const small=document.querySelector(".operator small");
    if(strong) strong.textContent=user.name || "CivicMesh Operator";
    if(small) small.textContent=user.role || "Human Review";
}

function cmLogin(){
    const email=(document.getElementById("cmLoginEmail")?.value||"").trim();
    const password=document.getElementById("cmLoginPassword")?.value||"";
    const error=document.getElementById("cmLoginError");
    if(email===CM_DEMO_USER.email && password===CM_DEMO_USER.password){
        localStorage.setItem("civicmesh_demo_user",JSON.stringify(CM_DEMO_USER));
        cmUpdateOperatorUI(CM_DEMO_USER);
        document.getElementById("civicLoginOverlay")?.classList.add("hidden");
        showToast("Signed in",`${CM_DEMO_USER.name} • ${CM_DEMO_USER.role}`);
    }else if(error){
        error.textContent="Invalid demo credentials. Use the credentials shown below.";
    }
}

function cmEnsureLogin(){
    const saved=localStorage.getItem("civicmesh_demo_user");
    if(saved){
        const user=JSON.parse(saved);
        cmUpdateOperatorUI(user);
        document.getElementById("civicLoginOverlay")?.classList.add("hidden");
    }
}

function openCitizenReport(){
    const user=JSON.parse(localStorage.getItem("civicmesh_demo_user")||"null");
    if(!user){
        document.getElementById("civicLoginOverlay")?.classList.remove("hidden");
        return;
    }
    const name=document.getElementById("cmReporterName");
    const email=document.getElementById("cmReporterEmail");
    if(name) name.value=user.name;
    if(email) email.value=user.email;
    document.getElementById("cmReportModal")?.classList.add("open");
}

function closeCitizenReport(){
    document.getElementById("cmReportModal")?.classList.remove("open");
}

function cmFillDemoReport(){
    document.getElementById("cmIssueType").value="Road Damage";
    document.getElementById("cmLocation").value="University Gate";
    document.getElementById("cmDescription").value="Deep pothole near the university gate. Water is collecting inside the road damage and vehicles are swerving.";
    document.getElementById("cmEvidence").value="Visible deep road depression; standing water; vehicle swerving";
}

async function submitCitizenReport(){
    const button=document.getElementById("cmSubmitReport");
    const status=document.getElementById("cmReportStatus");
    const payload={
        description:(document.getElementById("cmDescription")?.value||"").trim(),
        issue_type:document.getElementById("cmIssueType")?.value||"Unknown",
        location_text:(document.getElementById("cmLocation")?.value||"").trim(),
        evidence:(document.getElementById("cmEvidence")?.value||"").trim()
    };
    if(!payload.description){
        status.textContent="Please describe the issue first."; status.className="cm-report-status error"; return;
    }
    button.disabled=true; button.textContent="Processing…";
    status.textContent="Intake Agent receiving report…"; status.className="cm-report-status";
    try{
        const created=await fetch(`${CM_API}/api/reports`,{
            method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
        });
        if(!created.ok) throw new Error(`Report API returned ${created.status}`);
        const report=await created.json();
        status.textContent=`Report ${report.report_id} received → ${report.incident_id}`;
        await sleep(600);
        status.textContent="Evidence Agent → Fusion Agent → Priority Agent → Routing Agent…";
        const run=await fetch(`${CM_API}/api/incidents/${encodeURIComponent(report.incident_id)}/run`,{method:"POST"});
        if(!run.ok) throw new Error(`Pipeline API returned ${run.status}`);
        const result=await run.json();
        status.textContent=`✓ ${result.incident_id}: ${result.result.priority} priority • ${result.result.fusion_confidence}% fusion confidence • ${result.result.department}`;
        status.className="cm-report-status success";
        showToast("CivicMesh processed report",`${report.report_id} → ${result.incident_id} → Human Review`);
        setTimeout(()=>closeCitizenReport(),1800);
    }catch(error){
        console.error(error);
        status.textContent="Backend connection failed. Make sure FastAPI is running on port 8000.";
        status.className="cm-report-status error";
    }finally{
        button.disabled=false; button.textContent="Submit Report →";
    }
}

window.addEventListener("load",()=>{
    cmEnsureLogin();
});

/* =========================================================
   LOAD
========================================================= */

window.addEventListener(
    "load",
    () => {

        initializeDashboard();

    }
);