import { TextField, Button } from '@mui/material';

const ChangePassword = () => {
  return (
    <form className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center">Change Password</h2>
      <TextField label="New Password" type="password" fullWidth />
      <TextField label="Confirm Password" type="password" fullWidth />
      <Button variant="contained" color="primary" fullWidth>
        Change
      </Button>
    </form>
  );
};

export default ChangePassword;
