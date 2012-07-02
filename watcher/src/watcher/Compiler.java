package watcher;

import java.io.*;

class Compiler implements Runnable {

    private final String filename;
    private final String code;
    private final Callback callback;

    Compiler(String filename, String code, Callback callback) {
        this.filename = filename;
        this.code = code;
        this.callback = callback;
    }

    private void write(File f, String s) throws IOException {
        PrintWriter writer = new PrintWriter(f);
        writer.print(s);
        writer.flush();
        writer.close();
    }

    private byte[] runProcess(String cmd) throws Exception {
        Process p = Runtime.getRuntime().exec(cmd);
        p.waitFor();
        BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int r;
        while ((r = reader.read()) != -1) {
            out.write(r);
        }
        return out.toByteArray();
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
                write(source, code);
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

