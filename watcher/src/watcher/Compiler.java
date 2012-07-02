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

    private byte[] runProcess(String cmd) throws Exception {
        Process p = Runtime.getRuntime().exec(cmd);
        p.waitFor();
        InputStream is = p.getInputStream();
        return IOUtils.toByteArray(is);
    }

    public void run() {
        // TODO: error messages
        Object jar = null;
        try {
            try {
                File dir = File.createTempFile("settlers", System.nanoTime() + "");
                dir.delete();
                dir.mkdir();
                File source = new File(dir, filename);
                IOUtils.write(code, new FileWriter(source));
                File classes = new File(dir, "classes");
                classes.mkdir();
                runProcess("javac -d " + classes.getAbsolutePath() + " " + filename);
                jar = runProcess("jar c " + classes.getAbsolutePath());
            } catch (Exception e) {
                return;
            }
        } finally {
            callback.run(jar);
        }
    }
}

