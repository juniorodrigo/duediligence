using dd_back.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using dd_back.Models;

namespace dd_back.Controllers
{

    [Route("company")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompanyController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /company
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
        {
            return await _context.Companies.ToListAsync();
        }

        // POST: /company
        [HttpPost]
        public async Task<ActionResult<Company>> PostCompany(Company company)
        {
            company.LastEdited = DateTime.UtcNow;
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, company);
        }

        // GET: /company/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);

            if (company == null)
            {
                return NotFound();
            }

            return company;
        }

        // DELETE: /company/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound(); 
            }

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync(); 

            return NoContent(); 
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompany(int id, Company company)
        {
            if (id != company.Id)
            {
                return BadRequest(); // Retorna 400 si el ID no coincide
            }

            company.LastEdited = DateTime.UtcNow; 

            _context.Entry(company).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompanyExists(id))
                {
                    return NotFound(); 
                }
                else
                {
                    throw; 
                }
            }

            return NoContent();
        }

        private bool CompanyExists(int id)
        {
            return _context.Companies.Any(e => e.Id == id);
        }
    }
}
