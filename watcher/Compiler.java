import java.io.*;

class Compiler implements Runnable {

    private final String code;
    private final Callback callback;

    Compiler(String code, Callback callback) {
        this.code = code;
        this.callback = callback;
    }

    private boolean isAlphanum(char c) {
        return 'a' <= c && c <= 'z' || 'A' <= c && c <= 'Z' || '0' <= c && c <= '9' || c == '_' || c == '$';
    }

    private String deduceClassName() {
        // TODO: regex, efficiency, xss
        String[] lines = code.split("\n");
        for (String line : lines) {
            if (line.startsWith("public class ")) {
                String s = line.substring(13);
                int i = 0;
                while (i < s.length() && isAlphanum(s.charAt(i)))
                    i++;
                return s.substring(0, i);
            }
        }
        return null;
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
            String className = deduceClassName();
            if (className == null)
                return;
            String filename = className + ".java";
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

