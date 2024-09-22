using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using dd_back.Models;
using dd_back.Data;
using BCrypt.Net;
namespace dd_back.Controllers

{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password); // Usa BCrypt
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
            {
                // Verificar si el correo ya existe
                var existingUser = await _context.Users.SingleOrDefaultAsync(u => u.Email == user.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "El correo electrónico ya está en uso." });
                }

                // Hashear la contraseña (asegúrate de tener un método para esto)
                user.PasswordHash = HashPassword(user.PasswordHash); // Implementa este método para hashear la contraseña
                user.CreateTime = DateTime.UtcNow; // Establecer la fecha de creación a UTC

                // Guardar el nuevo usuario en la base de datos
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Retornar el nuevo usuario creado
                return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
            }
            catch (DbUpdateException ex) // Captura errores relacionados con la base de datos
            {
                return StatusCode(500, new { message = "Error al registrar el usuario.", error = ex.Message });
            }
            catch (Exception ex) // Captura cualquier otro tipo de error
            {
                return StatusCode(500, new { message = "Error interno del servidor.", error = ex.Message });
            }

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest("Email and password are required.");
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (user == null)
            {
                return Unauthorized();
            }

            // Verificar la contraseña
            if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
            {
                return Unauthorized();
            }

            // Realizar la petición para obtener el apiKey
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync("http://localhost:3000/authn/generate-key");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = "Error al obtener el apiKey." });
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var responseData = Newtonsoft.Json.JsonConvert.DeserializeObject<ResponseObject>(jsonResponse);


            return Ok(new { message = "Login successful", apiKey = responseData.Data.ApiKey,
                name = user.Name,  // Asegúrate de que el modelo User tenga la propiedad Name
                email = user.Email
            });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
    // Clase para mapear la respuesta
    public class ResponseObject
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public ResponseData Data { get; set; }
    }

    public class ResponseData
    {
        public string ApiKey { get; set; }
    }

}
