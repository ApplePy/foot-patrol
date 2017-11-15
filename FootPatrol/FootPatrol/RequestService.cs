using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace FootPatrol
{
    public static class RequestService
    {

        static HttpClient client = new HttpClient();

        public static async Task SendFootPatrolRequest(string name, string currentLocation, string destination)
        {

            //string json = string.Format("{'name': {0}, 'currentLocation': {1}, 'destination': {2}}", name, currentLocation, destination);
            FPRequest fpRequest = new FPRequest();
            fpRequest.name = name;
            fpRequest.currentLocation = currentLocation;
            fpRequest.destination = destination;
            string json = JsonConvert.SerializeObject(fpRequest);

            StringContent httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.PostAsJsonAsync("api/footpatrol", httpContent);
                response.EnsureSuccessStatusCode();

                String stringResponse = await response.Content.ReadAsStringAsync();
                //Check here for the request ID.  Use this id to cancel the request.

            } catch (Exception e)
            {
                //Console.WriteLine("{0} Exception caught.", e);
            }

        }

        public static async Task CancelFootPatrolRequest(string name, string currentLocation, string destination)
        {

            string json = string.Format("{'name': {0}, 'currentLocation': {1}, 'destination': {2}}", name, currentLocation, destination);
            StringContent httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.DeleteAsync("api/footpatrol");
                response.EnsureSuccessStatusCode();
            } catch (Exception e)
            {
                //Console.WriteLine("{0} Exception caught.", e);
            }

        }

    }

    public class FPRequest {
        public string name;
        public string currentLocation;
        public string destination;
    }
}



//static async Task<Uri> CreateProductAsync(Product product)
//{
//    HttpResponseMessage response = await client.PostAsJsonAsync("api/products", product);
//    response.EnsureSuccessStatusCode();

//    // return URI of the created resource.
//    return response.Headers.Location;
//}

//static async Task<Product> GetProductAsync(string path)
//{
//    Product product = null;
//    HttpResponseMessage response = await client.GetAsync(path);
//    if (response.IsSuccessStatusCode)
//    {
//        product  = await response.Content.ReadAsAsync<Product>();
//    }
//    return product;
//}

//static async Task<Product> UpdateProductAsync(Product product)
//{
//    HttpResponseMessage response = await client.PutAsJsonAsync($"api/products/{product.Id}", product);
//    response.EnsureSuccessStatusCode();

//    // Deserialize the updated product from the response body.
//    product = await response.Content.ReadAsStringAsync<Product>();
//    return product;
//}

//static async Task<HttpStatusCode> DeleteProductAsync(string id)
//{
//    HttpResponseMessage response = await client.DeleteAsync($"api/products/{id}");
//    return response.StatusCode;
//}

//static void Main()
//{
//    RunAsync().Wait();
//}