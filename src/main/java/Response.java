import javax.servlet.http.HttpServletResponse;
import static javax.servlet.http.HttpServletResponse.*;
import java.io.PrintWriter;

public class Response {

  public static final String JSON_CONTENT_TYPE = "application/json";

  public static void sendUnavailableError(HttpServletResponse response) throws Exception {
    sendUnavailableError(response, null);
  }
  public static void sendUnavailableError(HttpServletResponse response, String message) throws Exception {
    if(response == null) throw new NullPointerException("Need a response argument (first argument)");

    response.setStatus(SC_SERVICE_UNAVAILABLE);
    response.setContentType(JSON_CONTENT_TYPE);
    PrintWriter out = response.getWriter();
    out.write("{");
      out.write("\"status\": {");
        out.write("\"code\": ");
        out.write(SC_SERVICE_UNAVAILABLE);
        out.write(", \"message\": \"");
          out.write(message == null ? "SERVICE UNAVAILABLE" : message);
        out.write("\"");
      out.write("}");
    out.write("}");
    out.flush();
    return;
  }

}
