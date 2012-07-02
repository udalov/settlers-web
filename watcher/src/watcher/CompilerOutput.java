package watcher;

abstract class CompilerOutput {
}

class JarOutput extends CompilerOutput {
    public final byte[] jar;
    public final String javacStderr;

    JarOutput(byte[] jar, String javacStderr) {
        this.jar = jar;
        this.javacStderr = javacStderr;
    }
}

abstract class ErrorOutput extends CompilerOutput {
    abstract String reason();
}

class JavacErrorOutput extends ErrorOutput {
    public final String javacStderr;

    JavacErrorOutput(String javacStderr) {
        this.javacStderr = javacStderr;
    }

    String reason() { return "javac output:\n" + javacStderr; }
}

class OtherErrorOutput extends ErrorOutput {
    public final String message;

    OtherErrorOutput(String message) {
        this.message = message;
    }

    String reason() { return message; }
}

