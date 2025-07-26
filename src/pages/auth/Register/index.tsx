import { TextField, Button } from '@mui/material';

const Register = () => {
  return (
    <form className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <TextField label="Name" fullWidth />
      <TextField label="Email" type="email" fullWidth />
      <TextField label="Password" type="password" fullWidth />
      <Button variant="contained" color="primary" fullWidth>
        Register
      </Button>
    </form>
  );
};

export default Register;
