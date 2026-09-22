// MarketCrest Intake Audit - Swiss Minimalist Logic
let currentSlide = 0;
const totalQuestionSlides = 5;
const answers = [0, 0, 0, 0, 0];
const selectedAnswers = [null, null, null, null, null];
let lastReportData = null;

// General legal-industry lead-flow bands used to describe operating scale.
const LEAD_FLOW_PROFILES = {
    growthMinimum: 100,
    highVolumeMinimum: 400
};

const RED_FLAG_DEFINITIONS = [
    {
        qIndex: 0,
        title: "Slow Lead Response Time",
        text: "The Law Firm Intake Playbook sets a response standard of under five minutes for web forms, texts, and chat. A slow response gives the PNC time to contact another firm."
    },
    {
        qIndex: 1,
        title: "Zero After-Hours Intake",
        text: "The playbook calls for clear overflow, weekend, and after-hours coverage. A voicemail is a handoff with no owner until someone calls back."
    },
    {
        qIndex: 2,
        title: "Rule of 9 Follow-Up Gap",
        text: "The playbook uses nine contacts over 14 days across calls, texts, and emails. One attempt leaves warm PNCs without a clear path back."
    },
    {
        qIndex: 3,
        title: "Unscripted Phone Representative",
        text: "The playbook uses exact scripts for key moments and flexible talk tracks elsewhere. Without practice, fit screening, fee framing, and objection handling vary by staff member."
    },
    {
        qIndex: 4,
        title: "Unmonitored Call Quality & Tone",
        text: "The playbook calls for weekly coaching and role-play plus a deeper monthly call audit. Recorded calls turn weak moments into specific coaching actions."
    }
];

// Initialize UI
document.addEventListener("DOMContentLoaded", () => {
    updateProgress();
    setupKeyboardListeners();
});

function showSlide(index) {
    const slides = document.querySelectorAll(".slide-card");
    if (index < 0 || index >= slides.length) return;

    slides.forEach(slide => {
        slide.classList.remove("active");
    });

    currentSlide = index;
    const targetSlide = document.getElementById(`slide-${currentSlide}`);
    if (targetSlide) {
        targetSlide.classList.add("active");
    }

    updateProgress();
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function updateProgress() {
    const progressContainer = document.getElementById("progress-container");
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");

    if (currentSlide === 0) {
        progressContainer.style.opacity = "0";
    } else if (currentSlide >= 1 && currentSlide <= 5) {
        progressContainer.style.opacity = "1";
        const pct = Math.round((currentSlide / totalQuestionSlides) * 100);
        progressFill.style.width = `${pct}%`;
        progressText.innerText = `${currentSlide} of 5`;
    } else if (currentSlide === 6) {
        progressContainer.style.opacity = "1";
        progressFill.style.width = `100%`;
        progressText.innerText = `Final Step`;
    } else {
        progressContainer.style.opacity = "0";
    }
}

function selectOption(qIndex, value, btnElem) {
    answers[qIndex] = value;
    selectedAnswers[qIndex] = true;

    // Toggle selected state in grid
    const parentGrid = btnElem.closest(".options-grid");
    if (parentGrid) {
        parentGrid.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));
    }
    btnElem.classList.add("selected");

    // Enable Next button on current slide
    const nextBtn = document.getElementById(`next-btn-${qIndex}`);
    if (nextBtn) {
        nextBtn.disabled = false;
    }
}

function calculateAndShowResults() {
    const monthlyCallsInput = document.getElementById("monthly-calls");
    const monthlyHiresInput = document.getElementById("monthly-hires");
    const caseValueInput = document.getElementById("case-value");
    const monthlyCalls = Number(monthlyCallsInput.value);
    const monthlyHires = Number(monthlyHiresInput.value);
    const caseValue = Number(caseValueInput.value);

    if (!Number.isFinite(monthlyCalls) || monthlyCalls <= 0) {
        monthlyCallsInput.focus();
        return;
    }
    if (!Number.isFinite(monthlyHires) || monthlyHires < 0 || monthlyHires > monthlyCalls) {
        monthlyHiresInput.focus();
        return;
    }
    if (!Number.isFinite(caseValue) || caseValue <= 0) {
        caseValueInput.focus();
        return;
    }

    // Calculate total score
    const totalScore = answers.reduce((a, b) => a + b, 0);

    // Grade Mapping
    let grade = "F";
    let gradeClass = "grade-f";
    let gradeLabel = "Critical Intake Emergency";

    if (totalScore >= 90) {
        grade = "A";
        gradeClass = "grade-a";
        gradeLabel = "Optimal Intake System";
    } else if (totalScore >= 75) {
        grade = "B";
        gradeClass = "grade-b";
        gradeLabel = "Minor Intake Leakage";
    } else if (totalScore >= 60) {
        grade = "C";
        gradeClass = "grade-c";
        gradeLabel = "Moderate Intake Leakage";
    } else if (totalScore >= 45) {
        grade = "D";
        gradeClass = "grade-d";
        gradeLabel = "Severe Intake Leakage";
    } else {
        grade = "F";
        gradeClass = "grade-f";
        gradeLabel = "Critical Intake Emergency";
    }

    // Revenue math uses only firm-supplied values. The intake score does not
    // invent a conversion rate or claim a specific number of lost cases.
    const hireRate = (monthlyHires / monthlyCalls) * 100;
    const currentMonthlyRevenue = monthlyHires * caseValue;
    const additionalHireAnnualValue = caseValue * 12;

    const isStarved = monthlyCalls < LEAD_FLOW_PROFILES.growthMinimum;
    const isLeaking = totalScore < 75;
    let diagnosis = "Capture Ready";
    let diagnosisSummary = "Your inquiry volume is in a growth or high-volume profile, and your intake score shows no major capture warning.";

    if (isStarved && isLeaking) {
        diagnosis = "Starved + Leaking";
        diagnosisSummary = "You need more qualified opportunities and a stronger system for turning current PNCs into signed clients.";
    } else if (isStarved) {
        diagnosis = "Starved";
        diagnosisSummary = "Your intake foundation is workable, but your firm is currently in the focused lead-flow profile.";
    } else if (isLeaking) {
        diagnosis = "Leaking";
        diagnosisSummary = "You have opportunity volume. The larger gap is capturing more of the PNCs already reaching your firm.";
    }

    // Update Results UI
    const gradeBadge = document.getElementById("grade-badge");
    gradeBadge.className = `grade-circle ${gradeClass}`;
    gradeBadge.innerText = grade;

    document.getElementById("score-val").innerText = `${totalScore}% Intake Health`;
    document.getElementById("grade-label").innerText = gradeLabel;

    document.getElementById("diagnosis-title").innerText = `Your Pipeline Is ${diagnosis}`;
    document.getElementById("diagnosis-summary").innerText = diagnosisSummary;

    document.getElementById("hire-rate-val").innerText = `${formatPercentage(hireRate)} Hire Rate`;
    document.getElementById("current-revenue-val").innerText = `Current Monthly Retained Revenue: $${currentMonthlyRevenue.toLocaleString()}`;
    document.getElementById("additional-hire-desc").innerText = `Signing one more client every month adds $${caseValue.toLocaleString()} in monthly retained revenue, or $${additionalHireAnnualValue.toLocaleString()} across 12 extra clients per year.`;

    renderVolumeBenchmark(monthlyCalls);

    // Populate Top 3 Red Flags
    renderRedFlags();

    lastReportData = {
        totalScore,
        grade,
        gradeLabel,
        diagnosis,
        diagnosisSummary,
        monthlyCalls,
        monthlyHires,
        caseValue,
        hireRate,
        currentMonthlyRevenue,
        additionalHireAnnualValue,
        volumeStatus: document.getElementById("volume-status").innerText,
        benchmarkSummary: document.getElementById("benchmark-summary").innerText,
        priorities: answers
            .map((val, idx) => ({ val, definition: RED_FLAG_DEFINITIONS.find(item => item.qIndex === idx) }))
            .filter(item => item.val < 20)
            .sort((a, b) => a.val - b.val)
            .slice(0, 3)
            .map(item => item.definition)
    };

    // Show Results Slide
    showSlide(7);
}

function formatPercentage(value) {
    return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

function renderVolumeBenchmark(monthlyCalls) {
    let status = "Focused Lead Flow";
    let comparison = `Your firm handles ${monthlyCalls.toLocaleString()} monthly inquiries. This falls within the focused lead-flow range of fewer than ${LEAD_FLOW_PROFILES.growthMinimum.toLocaleString()} inquiries per month.`;

    if (monthlyCalls >= LEAD_FLOW_PROFILES.highVolumeMinimum) {
        status = "High-Volume Lead Flow";
        comparison = `Your firm handles ${monthlyCalls.toLocaleString()} monthly inquiries. This falls within the high-volume lead-flow range of ${LEAD_FLOW_PROFILES.highVolumeMinimum.toLocaleString()} or more inquiries per month.`;
    } else if (monthlyCalls >= LEAD_FLOW_PROFILES.growthMinimum) {
        status = "Growth Lead Flow";
        comparison = `Your firm handles ${monthlyCalls.toLocaleString()} monthly inquiries. This falls within the growth lead-flow range of ${LEAD_FLOW_PROFILES.growthMinimum.toLocaleString()} to ${(LEAD_FLOW_PROFILES.highVolumeMinimum - 1).toLocaleString()} inquiries per month.`;
    }

    document.getElementById("volume-status").innerText = status;
    document.getElementById("benchmark-summary").innerText = comparison;
}

function renderRedFlags() {
    const container = document.getElementById("red-flags-container");
    container.innerHTML = "";

    // Sort answers by lowest score first
    const indexed = answers.map((val, idx) => ({ val, idx })).filter(item => item.val < 20);
    indexed.sort((a, b) => a.val - b.val);

    // Pick top 3 worst scoring items
    const worst3 = indexed.slice(0, 3);

    if (worst3.length === 0) {
        container.innerHTML = '<div class="swiss-vuln-card"><div class="vuln-num">✓</div><div class="vuln-body"><div class="vuln-title">No Core Intake Gaps Flagged</div><div class="vuln-text">Your answers meet the five standards tested in this assessment. Validate them against recorded calls and weekly KPIs.</div></div></div>';
        return;
    }

    worst3.forEach((item, index) => {
        const flagDef = RED_FLAG_DEFINITIONS.find(def => def.qIndex === item.idx);
        if (flagDef) {
            const numStr = (index + 1).toString().padStart(2, "0");
            const card = document.createElement("div");
            card.className = "swiss-vuln-card";
            card.innerHTML = `
                <div class="vuln-num">${numStr}</div>
                <div class="vuln-body">
                    <div class="vuln-title">${flagDef.title}</div>
                    <div class="vuln-text">${flagDef.text}</div>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

function setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT") {
            if (e.key === "Enter") {
                if (currentSlide === 6) calculateAndShowResults();
            }
            return;
        }

        if (e.key === "Enter") {
            if (currentSlide === 0) {
                nextSlide();
            } else if (currentSlide >= 1 && currentSlide <= 5) {
                const qIdx = currentSlide - 1;
                if (selectedAnswers[qIdx]) {
                    nextSlide();
                }
            } else if (currentSlide === 6) {
                calculateAndShowResults();
            }
            return;
        }

        if (e.key === "ArrowRight") {
            if (currentSlide === 0 || (currentSlide >= 1 && currentSlide <= 5 && selectedAnswers[currentSlide - 1])) {
                nextSlide();
            }
        }
        if (e.key === "ArrowLeft") {
            if (currentSlide > 0 && currentSlide < 7) prevSlide();
        }

        if (currentSlide >= 1 && currentSlide <= 5) {
            const key = e.key.toUpperCase();
            const currentCard = document.getElementById(`slide-${currentSlide}`);
            if (!currentCard) return;

            const options = currentCard.querySelectorAll(".option-btn");
            if (key === "A" || key === "1") {
                if (options[0]) options[0].click();
            } else if (key === "B" || key === "2") {
                if (options[1]) options[1].click();
            } else if (key === "C" || key === "3") {
                if (options[2]) options[2].click();
            }
        }
    });
}

let submissionId = null;
let submissionBusy = false;
async function handleEmailSubmit(e) {
    e.preventDefault();
    if (submissionBusy || !lastReportData) return;
    const emailInput = document.getElementById("user-email");
    const userEmail = emailInput.value.trim();
    if (!userEmail || !emailInput.checkValidity()) return;
    submissionBusy = true;
    const sendBtn = document.getElementById("send-report-btn");
    const successMsg = document.getElementById("email-success-msg");
    sendBtn.disabled = true;
    sendBtn.innerText = "Saving…";
    try {
        submissionId = submissionId || crypto.randomUUID();
        const savedToFile = await BoothStorage.save({
            id: submissionId,
            email: userEmail,
            score: lastReportData.totalScore,
            monthlyInquiries: lastReportData.monthlyCalls,
            monthlyHires: lastReportData.monthlyHires,
            averageRetainer: lastReportData.caseValue,
            timestamp: new Date().toISOString(),
            responses: Array.from(document.querySelectorAll('.option-btn.selected .option-label'), el => el.textContent.trim()),
            report: lastReportData
        });
        successMsg.textContent = savedToFile
            ? "Email and results saved to your spreadsheet."
            : "Email and results saved in this browser only. Use Spreadsheet backup below to choose your file or download a backup.";
        sendBtn.innerText = "Saved ✓";
        try { downloadReportPdf(userEmail); }
        catch (_) { successMsg.textContent += " PDF download failed. Your response is still saved."; }
    } catch (error) {
        successMsg.textContent = `Response not saved: ${error.message}`;
        sendBtn.disabled = false;
        sendBtn.innerText = "Retry Save";
    } finally {
        successMsg.style.display = "block";
        submissionBusy = false;
    }
}

function downloadReportPdf(userEmail) {
    if (!lastReportData) return;

    const report = lastReportData;
    const lines = [];
    const add = (text, style = "body") => lines.push({ text, style });

    add("MARKETCREST | LAW FIRM GROWTH AGENCY", "eyebrow");
    add(`Your Pipeline Is ${report.diagnosis}`, "title");
    add(report.diagnosisSummary);
    add("");
    add(`Grade ${report.grade} | ${report.totalScore}% Intake Health`, "heading");
    add(report.gradeLabel);
    add(`Monthly inquiries: ${report.monthlyCalls.toLocaleString()}`);
    add(`Average signed retainer: $${report.caseValue.toLocaleString()}`);
    add("");
    add("PIPELINE BREAKDOWN", "heading");
    add(report.volumeStatus, "subheading");
    add(report.benchmarkSummary);
    add("");
    add("YOUR CURRENT NUMBERS", "heading");
    add(`Signed clients per month: ${report.monthlyHires.toLocaleString()}`);
    add(`Actual inquiry-to-hire rate: ${formatPercentage(report.hireRate)}`);
    add(`Current monthly retained revenue: $${report.currentMonthlyRevenue.toLocaleString()}`);
    add(`Value of signing one more client every month: $${report.caseValue.toLocaleString()} in additional monthly retained revenue, or $${report.additionalHireAnnualValue.toLocaleString()} across 12 extra clients per year.`);
    add("");
    add("TOP PRIORITIES", "heading");

    if (report.priorities.length === 0) {
        add("No core intake gaps were flagged. Validate these answers against recorded calls and weekly KPIs.");
    } else {
        report.priorities.forEach((priority, index) => {
            add(`${index + 1}. ${priority.title}`, "subheading");
            add(priority.text);
        });
    }

    add("");
    add(`Report prepared for: ${userEmail}`);
    add(`Generated: ${new Date().toLocaleDateString()}`);

    const pdfBlob = buildSimplePdf(lines);
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MarketCrest-Pipeline-Report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildSimplePdf(lines) {
    const clean = text => String(text)
        .replace(/™/g, "")
        .replace(/[–—]/g, "-")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[^\x20-\x7E]/g, "");
    const escapePdf = text => clean(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const wrap = (text, limit) => {
        const words = clean(text).split(/\s+/).filter(Boolean);
        if (!words.length) return [""];
        const wrapped = [];
        let row = "";
        words.forEach(word => {
            const next = row ? `${row} ${word}` : word;
            if (next.length > limit && row) {
                wrapped.push(row);
                row = word;
            } else {
                row = next;
            }
        });
        wrapped.push(row);
        return wrapped;
    };

    const settings = {
        eyebrow: { font: "F2", size: 9, leading: 15, color: "0 0.68 0.94" },
        title: { font: "F2", size: 22, leading: 30, color: "0 0.17 0.24" },
        heading: { font: "F2", size: 12, leading: 20, color: "0 0.17 0.24" },
        subheading: { font: "F2", size: 10, leading: 16, color: "0 0.17 0.24" },
        body: { font: "F1", size: 9, leading: 14, color: "0.2 0.42 0.54" }
    };
    let y = 750;
    const commands = [];
    lines.forEach(line => {
        const setting = settings[line.style] || settings.body;
        const limit = line.style === "title" ? 44 : 88;
        wrap(line.text, limit).forEach(row => {
            if (y < 42) return;
            commands.push(`${setting.color} rg BT /${setting.font} ${setting.size} Tf 42 ${y} Td (${escapePdf(row)}) Tj ET`);
            y -= setting.leading;
        });
    });

    const stream = commands.join("\n");
    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
        `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(new TextEncoder().encode(pdf).length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
        pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
}

function restartAudit() {
    if (submissionBusy) return;
    submissionId = null;
    answers.fill(0);
    selectedAnswers.fill(null);
    document.querySelectorAll(".option-btn").forEach(btn => btn.classList.remove("selected"));
    document.querySelectorAll(".btn-next-q").forEach(btn => btn.disabled = true);
    
    const sendBtn = document.getElementById("send-report-btn");
    if (sendBtn) {
        sendBtn.innerText = "Get My Report →";
        sendBtn.disabled = false;
    }
    const successMsg = document.getElementById("email-success-msg");
    if (successMsg) successMsg.style.display = "none";
    const emailInput = document.getElementById("user-email");
    if (emailInput) emailInput.value = "";
    lastReportData = null;

    showSlide(0);
}
