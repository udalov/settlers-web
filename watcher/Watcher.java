import com.mongodb.*;
import java.io.*;
import java.util.*;

public class Watcher {

    private final DB db;
    private final DBCollection solutions;
    private final DBCollection submissions;

    private static final long TIME_TO_WAIT = 1000;

    private Watcher(DB db) {
        this.db = db;
        solutions = db.getCollection("solutions");
        submissions = db.getCollection("submissions");
    }

    private void process(final DBObject submission) throws Exception {
        // TODO: logging
        final Object id = submission.get("_id");
        final DBObject submissionQuery = new BasicDBObject();
        submissionQuery.put("_id", id);
        submission.put("status", 1);
        submissions.update(submissionQuery, submission);
System.out.println("processing " + id);
        final DBObject solutionQuery = new BasicDBObject();
        solutionQuery.put("_id", submission.get("solution"));
        DBCursor cur = solutions.find(solutionQuery);
        if (!cur.hasNext())
            throw new IllegalStateException("Solution " + submission.get("solution") + " corresponding to submission " + id + " is not found");
        final DBObject solution = cur.next();
        assert !cur.hasNext() : "Several solutions correspond to the same submission";
        String code = solution.get("code") + "";
        new Thread(new Compiler(code, new Callback() {
            public void run(Object jar) {
                if (jar == null) {
System.out.println("fail " + id);
                    submission.put("status", 3);
                    submissions.update(submissionQuery, submission);
                    return;
                }
                solution.put("jar", jar);
                solutions.update(solutionQuery, solution);
                submission.put("status", 2);
                submissions.update(submissionQuery, submission);
System.out.println("ok " + id);
            }
        })).start();
    }

    private void run() throws Exception {
        DBObject query = new BasicDBObject();
        query.put("status", 0);
        while (true) {
            DBCursor cur = submissions.find(query);
            while (cur.hasNext()) {
                process(cur.next());
            }
            try {
                Thread.sleep(TIME_TO_WAIT);
            } catch (InterruptedException ie) {
                break;
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Mongo m = null;
        try {
            m = new Mongo("127.0.0.1", 27017);
            new Watcher(m.getDB("settlers")).run();
        } finally {
            m.close();
        }
    }
}

