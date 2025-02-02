﻿namespace TrashMob.Controllers
{
    using Microsoft.ApplicationInsights;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Identity.Web.Resource;
    using System;
    using System.Threading.Tasks;
    using TrashMob.Shared;
    using TrashMob.Shared.Models;
    using TrashMob.Shared.Persistence;

    [Route("api/admin")]
    public class AdminController : BaseController
    {
        private readonly IPartnerRequestRepository partnerRequestRepository;
        private readonly IUserRepository userRepository;

        public AdminController(IPartnerRequestRepository partnerRequestRepository, 
                               IUserRepository userRepository, 
                               TelemetryClient telemetryClient) 
            : base(telemetryClient)
        {
            this.partnerRequestRepository = partnerRequestRepository;
            this.userRepository = userRepository;
        }

        [HttpPut("partnerrequestupdate/{userId}")]
        [Authorize]
        [RequiredScope(Constants.TrashMobWriteScope)]
        public async Task<IActionResult> UpdatePartnerRequest(Guid userId, PartnerRequest partnerRequest)
        {
            var user = await userRepository.GetUserByInternalId(userId).ConfigureAwait(false);

            if (user == null || !ValidateUser(user.NameIdentifier) || user.IsSiteAdmin)
            {
                return Forbid();
            }

            TelemetryClient.TrackEvent(nameof(UpdatePartnerRequest));
            return Ok(await partnerRequestRepository.UpdatePartnerRequest(partnerRequest).ConfigureAwait(false));
        }
    }
}
