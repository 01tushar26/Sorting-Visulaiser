import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class SortingServer {

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/sort", new SortHandler());
        server.setExecutor(null); // Default executor
        server.start();
        System.out.println("Server is running on http://localhost:8080");
    }

    static class SortHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Add CORS headers
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                // Handle preflight request
                exchange.sendResponseHeaders(204, -1); // No content
                return;
            }

            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    // Parse query parameters
                    String query = exchange.getRequestURI().getQuery();
                    if (query == null || !query.startsWith("algorithm=")) {
                        throw new IllegalArgumentException("Missing or invalid 'algorithm' parameter");
                    }
                    String algorithm = query.split("=")[1];

                    // Parse request body
                    String requestBody = new String(exchange.getRequestBody().readAllBytes());
                    List<Integer> numbers = Arrays.stream(requestBody.replace("[", "").replace("]", "").split(","))
                                                  .map(String::trim)
                                                  .map(Integer::parseInt)
                                                  .collect(Collectors.toList());

                    // Perform sorting
                    List<Integer> sortedNumbers = switch (algorithm) {
                        case "bubble" -> bubbleSort(numbers);
                        case "selection" -> selectionSort(numbers);
                
                        default -> throw new IllegalArgumentException("Unknown algorithm: " + algorithm);
                    };
                    

                    // Send JSON response
                    String response = sortedNumbers.stream()
                                                   .map(String::valueOf)
                                                   .collect(Collectors.joining(",", "[", "]"));
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, response.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(response.getBytes());
                    os.close();
                } catch (Exception e) {
                    // Handle errors
                    String errorResponse = "{\"error\": \"" + e.getMessage() + "\"}";
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(400, errorResponse.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(errorResponse.getBytes());
                    os.close();
                }
            }
        }

        private List<Integer> bubbleSort(List<Integer> numbers) {
            int n = numbers.size();
            Integer[] arr = numbers.toArray(new Integer[0]);
            for (int i = 0; i < n - 1; i++) {
                for (int j = 0; j < n - i - 1; j++) {
                    if (arr[j] > arr[j + 1]) {
                        int temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                    }
                }
            }
            return Arrays.asList(arr);
        }
       
 private List<Integer> selectionSort(List<Integer> numbers) {
            int n = numbers.size();
            Integer[] arr = numbers.toArray(new Integer[0]);
            for (int i = 0; i < n - 1; i++) {
                int minIndex = i;
                for (int j = i + 1; j < n; j++) {
                    if (arr[j] < arr[minIndex]) {
                        minIndex = j;
                    }
                }
                int temp = arr[minIndex];
                arr[minIndex] = arr[i];
                arr[i] = temp;
            }
            return Arrays.asList(arr);
        }
    }
}
