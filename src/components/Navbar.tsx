import { useUserStore } from '@/stores/user.store';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

// const Navbar = () => {
//   const { user } = useUserStore();
//   return (
//     <header className="bg-[#1E293B] text-white flex justify-end items-center px-6 py-3 shadow">
//       <div className="flex items-center gap-4">
//         <IconButton>
//           <NotificationsNone sx={{ color: 'white' }} />
//         </IconButton>
//         <Avatar
//           alt="User"
//           src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
//         />
//       </div>
//     </header>
//   );
// };

export default function Navbar() {
  const { user } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openProfileMenu = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-end">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="open main menu"
              aria-expanded={mobileMenuOpen ? 'true' : undefined}
              aria-controls="mobile-menu"
              className="text-gray hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
              size="large"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </div>

          {/* Right side: notifications + profile */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <IconButton
              className="text-white hover:text-gray-300"
              aria-label="view notifications"
              size="large"
              sx={{ color: 'white', bgcolor: 'gray.800' }}
            >
              <NotificationsIcon />
            </IconButton>

            {/* Profile dropdown */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              className="ml-3 rounded-full bg-white text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
            >
              <Avatar
                alt="User Avatar"
                src={`https://ui-avatars.com/api/?name=${user?.name}+${user?.lastname}`}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>

            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={openProfileMenu}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                className:
                  'w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5',
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>Your Profile</MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>Sign out</MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
