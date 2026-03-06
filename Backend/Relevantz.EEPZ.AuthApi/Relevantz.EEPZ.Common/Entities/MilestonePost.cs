using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Relevantz.EMT.Common.Entities
{
    [Table("MilestonePost")]
    public class MilestonePost
    {
        [Key]
        public int PostId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(20)]
        public string MilestoneType { get; set; }

        public int? YearsCompleted { get; set; }

        [Required]
        public string PostMessage { get; set; }

        [MaxLength(500)]
        public string? ImagePath { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime PostedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
