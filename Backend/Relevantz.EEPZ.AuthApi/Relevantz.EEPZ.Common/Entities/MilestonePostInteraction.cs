using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Relevantz.EMT.Common.Entities
{
    [Table("MilestonePostInteraction")]
    public class MilestonePostInteraction
    {
        [Key]
        public int InteractionId { get; set; }

        [Required]
        public int PostId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [Required]
        [MaxLength(20)]
        public string InteractionType { get; set; }

        [MaxLength(10)]
        public string? ReactionEmoji { get; set; }

        [MaxLength(500)]
        public string? CommentText { get; set; }
        public bool IsEdited { get; set; } = false;
        public DateTime? EditedAt { get; set; } = null;
        public int? ReplyToInteractionId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
