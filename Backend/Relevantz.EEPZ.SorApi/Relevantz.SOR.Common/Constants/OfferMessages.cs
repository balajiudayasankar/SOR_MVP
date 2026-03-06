namespace Relevantz.SOR.Common.Constants;

public static class OfferMessages
{
    public const string OfferCreated = "Offer created successfully.";
    public const string OfferUpdated = "Offer details updated successfully.";
    public const string OfferDraftSaved = "Offer saved as draft.";
    public const string OfferSubmitted = "Offer submitted for approval.";
    public const string OfferNotFound = "Offer not found.";
    public const string OfferAlreadySubmitted = "Offer is already under approval. Editing is not allowed.";
    public const string OfferRegenerated = "Offer regenerated successfully.";
    public const string OfferInternallyApproved = "Offer has been internally approved.";
    public const string OfferCancelled = "Offer cancelled successfully.";
    public const string InvalidOfferType = "Invalid offer type specified.";
    public const string CandidateNotInOfferStage = "Candidate must be in offer stage to create an offer.";
    public const string FullTimeOfferAlreadyExists = "A Full-Time offer already exists for this candidate.";
    public const string InternshipOfferAlreadyExists = "An Internship offer already exists for this candidate.";
}
