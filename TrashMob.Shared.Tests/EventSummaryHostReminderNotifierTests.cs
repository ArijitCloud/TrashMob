namespace TrashMob.Shared.Tests
{
    using Moq;
    using System.Threading;
    using System.Threading.Tasks;
    using TrashMob.Shared.Engine;
    using TrashMob.Shared.Persistence;
    using Xunit;

    public class EventSummaryHostReminderNotifierTests : NotifierTestsBase
    {
        protected override NotificationTypeEnum NotificationType => NotificationTypeEnum.EventSummaryHostReminder;

        [Fact]
        public async Task GenerateNotificationsAsync_WithNoDataAvailable_Succeeds()
        {
            // Arrange
            var engine = new EventSummaryHostReminderNotifier(EventRepository.Object, UserRepository.Object, EventAttendeeRepository.Object, UserNotificationRepository.Object, UserNotificationPreferenceRepository.Object, EmailSender.Object, MapRepository.Object, Logger.Object);

            // Act
            await engine.GenerateNotificationsAsync().ConfigureAwait(false);

            // Assert
            EmailSender.Verify(_ => _.SendEmailAsync(It.IsAny<Email>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [Fact]
        public void GetHtmlEmailTemplate_Succeeds()
        {
            // Arrange
            var engine = new EventSummaryHostReminderNotifier(EventRepository.Object, UserRepository.Object, EventAttendeeRepository.Object, UserNotificationRepository.Object, UserNotificationPreferenceRepository.Object, EmailSender.Object, MapRepository.Object, Logger.Object);

            // Act
            var template = engine.GetHtmlEmailTemplate();

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(template));
            Assert.Contains("Don't forget to update you TrashMob.eco Event Summary!", template);
        }
    }
}
