﻿namespace TrashMob.Persistence
{
    using Microsoft.EntityFrameworkCore;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using TrashMob.Extensions;
    using TrashMob.Models;

    public class UserRepository : IUserRepository
    {
        private readonly MobDbContext mobDbContext;

        public UserRepository(MobDbContext mobDbContext)
        {
            this.mobDbContext = mobDbContext;
        }

        public async Task<IEnumerable<User>> GetAllUsers()
        {
            try
            {
                return await mobDbContext.Users.ToListAsync().ConfigureAwait(false);
            }
            catch
            {
                throw;
            }
        }

        // Add new User record     
        public async Task<Guid> AddUser(User user)
        {
            try
            {
                user.Id = Guid.NewGuid();
                mobDbContext.Users.Add(user);
                await mobDbContext.SaveChangesAsync().ConfigureAwait(false);
                return user.Id;
            }
            catch
            {
                throw;
            }
        }

        // Update the records of a particluar user
        public Task<int> UpdateUser(User user)
        {
            try
            {
                mobDbContext.Entry(user).State = EntityState.Modified;
                return mobDbContext.SaveChangesAsync();
            }
            catch
            {
                throw;
            }
        }

        // Get the details of a particular User
        public async Task<User> GetUserByInternalId(Guid id)
        {
            try
            {
                return await mobDbContext.Users.FindAsync(id).ConfigureAwait(false);
            }
            catch
            {
                throw;
            }
        }

        // Delete the record of a particular User
        public async Task<int> DeleteUserByInternalId(Guid id)
        {
            try
            {
                var user = await mobDbContext.Users.FindAsync(id).ConfigureAwait(false);
                mobDbContext.Users.Remove(user);
                return await mobDbContext.SaveChangesAsync().ConfigureAwait(false);
            }
            catch
            {
                throw;
            }
        }
    }
}
