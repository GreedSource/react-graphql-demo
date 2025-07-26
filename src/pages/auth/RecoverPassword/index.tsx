import { TextField, Button } from '@mui/material';

const RecoverPassword = () => {
  return (
    <form className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center">Recover Password</h2>
      <TextField label="Email" type="email" fullWidth />
      <Button variant="contained" color="primary" fullWidth>
        Send Reset Link
      </Button>
    </form>
  );
};

export default RecoverPassword;
