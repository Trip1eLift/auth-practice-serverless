import { useState, useEffect, ChangeEventHandler } from 'react';
import './App.css';
import axios from 'axios';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface alertMessage {
  isOn: boolean;
  severity: "success" | "error";
  text: string;
  time: 2000;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({isOn: false, severity: "success", text: ""} as alertMessage);

  useEffect(() => {
    const turnOffAlert = async () => {
      await new Promise(res => setTimeout(res, alert.time));
      setAlert({isOn: false, severity: "success", text: ""} as alertMessage);
    }
    turnOffAlert();
  }, [alert]);

  function handleLogin(e: React.MouseEvent<HTMLElement>) {
    if (email.length > 0 && password.length > 0) {
      axios.get("http://localhost:8080/login", { params: {email:email, password:password} })
        .then((res) => {
          if (res.data.login === true) {
            localStorage.setItem('X-Access-Token', res.headers['X-Access-Token']);
            setAlert({isOn: true, severity:"success", text: `ID: ${res.data.user.id}, Name: ${res.data.user.name}`} as alertMessage);
          } else {
            setAlert({isOn: true, severity:"error", text: "Login failed."} as alertMessage);
          }
        })
    }
  }

  function handleVerifyLogin(e: React.MouseEvent<HTMLElement>) {
    const token = localStorage.getItem('X-Access-Token');
    if (token == null)
      return;
    axios.get("http://localhost:8080/login-verify", { headers: {'X-Access-Token': token} })
      .then((res) => {
        if (res.data.login === true) {
          localStorage.setItem('x-access-token', res.headers['x-access-token']);
          setAlert({isOn: true, severity:"success", text: `User is login, renew token.`} as alertMessage);
        }
      })
      .catch((err) => {
        console.log(err)
        setAlert({isOn: true, severity:"error", text: "User is not login."} as alertMessage);
      })
  }

  function handleEmailChange(e: React.FormEvent<HTMLInputElement>) {
    setEmail(e.currentTarget.value);
  }

  function handlePasswordChange(e: React.FormEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
  }

  return (
    <div className="App">
      <>
        <div>1. To test authentication, use email: master@ctpc.com and password: hardpassword to login.</div>
        <div>2. To test authorization, press VERIFY LOGIN STATUS after login. The token expires in 10 second. Token is renewed when verifying.</div>
      </>
      <Box sx={{ flexGrow: 1 }} style={{marginTop: "3rem"}}>
        <Grid container={true} spacing={2} direction="column" alignItems="center">
          <Grid item xs={8}>
            <TextField onChange={handleEmailChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>} id="standard-basic" label="ID" variant="standard" />
          </Grid>
          <Grid item xs={8}>
            <TextField onChange={handlePasswordChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>} id="standard-basic" label="Password" variant="standard" />
          </Grid>
          <Grid item xs={8}>
            <Button onClick={handleLogin as React.MouseEventHandler<HTMLButtonElement>} variant="contained">Login</Button>
          </Grid>
          <Grid item xs={8}>
            <Button onClick={handleVerifyLogin as React.MouseEventHandler<HTMLButtonElement>} variant="outlined">Verify Login Status</Button>
          </Grid>
        </Grid>
      </Box>
      {alert.isOn && <Alert severity={alert.severity} style={{position:"fixed", width:"20rem", left:"50%", top:"100%", transform:"translate(-50%,-100%)"}}>
        {alert.text}
      </Alert>}
    </div>
  );
}