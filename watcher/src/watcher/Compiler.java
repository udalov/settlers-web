package watcher;

import java.io.*;
import org.apache.commons.io.IOUtils;

class Compiler implements Runnable {

    private final String filename;
    private final String code;
    private final Callback<CompilerOutput> callback;

    Compiler(String filename, String code, Callback<CompilerOutput> callback) {
        this.filename = filename;
        this.code = code;
        this.callback = callback;
    }

    private void writeToFile(File f, String s) throws IOException {
        FileWriter w = new FileWriter(f);
        try {
            IOUtils.write(s, w);
        } finally {
            w.close();
        }
    }

    private Process runProcess(String cmd) throws IOException {
System.out.println("running " + cmd);
        Process p = Runtime.getRuntime().exec(cmd);
        try {
            p.waitFor();
        } catch (InterruptedException ie) {
            return null;
        }
        return p;
    }

    private String runProcessGetErrorString(String cmd) throws IOException {
        Process p = runProcess(cmd);
        if (p == null) return null;
        return IOUtils.toString(p.getErrorStream());
    }

    private byte[] runProcessGetOutputBytes(String cmd) throws IOException {
        Process p = runProcess(cmd);
        if (p == null) return null;
        return IOUtils.toByteArray(p.getInputStream());
    }

    private CompilerOutput compile() {
        if (!filename.endsWith(".java") || filename.length() < 6)
            return new OtherErrorOutput("Inappropriate filename");
        String className = filename.substring(0, filename.length() - 5);
        try {
            File dir = File.createTempFile("settlers", System.nanoTime() + "");
            dir.delete();
            dir.mkdir();

            File manifest = new File(dir, "MANIFEST.MF");
            writeToFile(manifest, "Main-Class: " + className + "\n");
            
            File source = new File(dir, filename);
            writeToFile(source, code);

            File classes = new File(dir, "classes");
            classes.mkdir();

            String javac = runProcessGetErrorString("javac -d " + classes.getAbsolutePath() + " " + source.getAbsolutePath());
            if (javac != null && !javac.isEmpty()) {
                // TODO: tell apart errors and warnings
                return new JavacErrorOutput(javac);
            }
            byte[] bytes = runProcessGetOutputBytes("jar cm " + manifest.getAbsolutePath() + " -C " + classes.getAbsolutePath() + " .");

            if (bytes == null || bytes.length == 0)
                return new OtherErrorOutput("Jar produced empty output");

            return new JarOutput(bytes, null);
        } catch (IOException e) {
            e.printStackTrace();
            return new OtherErrorOutput("Exception while compiling: " + e.getMessage());
        }
    }

    public void run() {
        CompilerOutput result = null;
        try {
            result = compile();
        } finally {
            callback.run(result);
        }
    }
}

