using Microsoft.EntityFrameworkCore;
using dd_back.Models;

namespace dd_back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Company>()
                .Property(c => c.LastEdited)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
