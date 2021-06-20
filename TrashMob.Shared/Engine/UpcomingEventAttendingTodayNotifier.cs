﻿
namespace TrashMob.Shared.Engine
{
    using System.Threading;
    using System.Threading.Tasks;
    using TrashMob.Shared.Persistence;

    public class UpcomingEventAttendingTodayNotifier : NotificationEngineBase, INotificationEngine
    {
        protected override NotificationTypeEnum NotificationType => NotificationTypeEnum.UpcomingEventAttendingToday;

        protected override string EmailSubject => "Upcoming TrashMob.eco events in your area today!";

        public UpcomingEventAttendingTodayNotifier(IEventRepository eventRepository,
                                                   IUserRepository userRepository, 
                                                   IEventAttendeeRepository eventAttendeeRepository,
                                                   IUserNotificationRepository userNotificationRepository,
                                                   IEmailSender emailSender) : 
            base(eventRepository, userRepository, eventAttendeeRepository, userNotificationRepository, emailSender)
        {
        }

        public Task GenerateNotificationsAsync(CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }
}
