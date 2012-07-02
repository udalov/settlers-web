package watcher;

import java.io.*;
import org.apache.commons.io.IOUtils;

class Compiler implements Runnable {

    private final String filename;
    private final String code;
    private final Callback callback;

    Compiler(String filename, String code, Callback callback) {
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

    private byte[] runProcess(String cmd) throws IOException {
System.out.println("running " + cmd);
        Process p = Runtime.getRuntime().exec(cmd);
        try {
            p.waitFor();
        } catch (InterruptedException ie) {
            return null;
        }
        InputStream is = p.getInputStream();
        return IOUtils.toByteArray(is);
    }

    public void run() {
        // TODO: error messages
        Object result = null;
        try {
            if (!filename.endsWith(".java") || filename.length() < 6)
                return;
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

                runProcess("javac -d " + classes.getAbsolutePath() + " " + source.getAbsolutePath());
                result = runProcess("jar cm " + manifest.getAbsolutePath() + " -C " + classes.getAbsolutePath() + " .");
            } catch (IOException e) {
                return;
            }
        } finally {
            callback.run(result);
        }
    }
}

