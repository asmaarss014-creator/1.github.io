let pyodideInstance = null;

// Self-bootstrapping entry routines asynchronously mapped on load events step
window.onload = async function() {
    try {
        pyodideInstance = await loadPyodide();
        document.getElementById("pyTerminal").innerText = "Python compiler core successfully loaded. Standing by for calculation execution calls...";
    } catch (err) {
        document.getElementById("pyTerminal").innerText = "Error booting environment layer engine offline: " + err.toString();
    }
};

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`nav_${tabId}`).classList.add('active');
    document.getElementById(`tab_content_${tabId}`).classList.add('active');
}

function clearTerminalDisplay(targetId) {
    document.getElementById(targetId).innerText = "Terminal wiped. Standing by...";
}

// --- JAVA RUNTIME TRANSLATOR ENGINE ---
function executeJavaCompilationLoop() {
    const terminal = document.getElementById("javaTerminal");
    const code = document.getElementById("javaCodeArea").value;
    terminal.innerText = "Compiling source structure codes...\n";

    let outputBuffer = [];
    const customStdout = {
        println: function(txt) { outputBuffer.push(String(txt)); },
        print: function(txt) { outputBuffer.push(String(txt)); }
    };

    try {
        let mainMethodBody = "";
        const mainMatch = code.match(/public\s+static\s+void\s+main\s*\(String\[\]\s+\w+\)\s*\{([\s\S]*)\}/);
        
        if (mainMatch && mainMatch[1]) {
            mainMethodBody = mainMatch[1];
        } else {
            throw new Error("Syntax error mapping pattern compilation: Missing standard target statement 'public static void main(String[] args)' entry signature routing layout.");
        }

        let runnableJsTranslation = mainMethodBody
            .replace(/System\.out\.println\s*\(([\s\S]*?)\);/g, "stdout.println($1);")
            .replace(/System\.out\.print\s*\(([\s\S]*?)\);/g, "stdout.print($1);")
            .replace(/(String|int|double|float|boolean|char)\s+(\w+)\s*=/g, "let $2 =");

        const runnerContextFactory = new Function("stdout", runnableJsTranslation);
        runnerContextFactory(customStdout);

        terminal.innerText = outputBuffer.join("\n") + "\n\n>> BUILD SUCCESSFUL (Execution pipeline runtime completed successfully).";
    } catch (compileErr) {
        terminal.innerText = "❌ RUNTIME ERROR MAPPING / COMPILER DEBUG DEBUGGER ATTEMPT FAILURE:\n\n" + compileErr.toString();
    }
}

// --- PYTHON API LAYER RUNNER ENGINE ---
async function executePythonInterpreterLoop() {
    const terminal = document.getElementById("pyTerminal");
    const code = document.getElementById("pyCodeArea").value;
    terminal.innerText = "Executing target Python instructions package components...\n";

    if (!pyodideInstance) {
        terminal.innerText = "Interpreter module engine not ready yet. Please allow code cache modules downloading sequence to verify initialization parameters.";
        return;
    }

    let outputLogs = [];
    pyodideInstance.setStdout({ batched: (str) => outputLogs.push(str) });
    pyodideInstance.setStderr({ batched: (str) => outputLogs.push("⚠️ " + str) });

    try {
        await pyodideInstance.runPythonAsync(code);
        terminal.innerText = outputLogs.join("\n") + "\n\n>> SCRIPT EXECUTED SUCCESSFUL (Process completed with exit code 0).";
    } catch (pyError) {
        terminal.innerText = "❌ PYTHON TRACEBACK EXCEPTION INTERPRETER ERROR:\n\n" + pyError.toString();
    }
}

