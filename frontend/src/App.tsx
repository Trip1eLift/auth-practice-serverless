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
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({isOn: false, severity: "success", text: ""} as alertMessage);
  const [messages, setMessages] = useState([] as string[]);

  useEffect(() => {
    const turnOffAlert = async () => {
      await new Promise(res => setTimeout(res, 5000));
      setAlert({isOn: false, severity: "success", text: ""} as alertMessage);
    }
    turnOffAlert();
  }, [alert]);

  function handleLogin(e: React.MouseEvent<HTMLElement>) {
    if (email.length > 0 && password.length > 0) {
      axios.post("http://localhost:8080/login", {email:email, password:password})
        .then((res) => {
          if (res.data.login === true) {
            localStorage.setItem('x-access-token', res.headers['x-access-token']);
            const text = `Name: ${res.data.name}, Email: ${res.data.email}, Access Level: ${res.data.accessLevel}, Birthday: ${res.data.dateOfBirth}`;
            setAlert({isOn: true, severity:"success", text: text} as alertMessage);
            setMessages([...messages, text]);
          }
        })
        .catch((err) => {
          console.error(err);
          setAlert({isOn: true, severity:"error", text: "User fails to login."} as alertMessage);
          setMessages([...messages, "User fails to login."]);
        });
    }
  }

  function handleVerifyLogin(e: React.MouseEvent<HTMLElement>) {
    const token = localStorage.getItem('x-access-token');
    axios.get("http://localhost:8080/login-verify", { headers: {'x-access-token': token!} })
      .then((res) => {
        if (res.data.login === true) {
          localStorage.setItem('x-access-token', res.headers['x-access-token']);
          const text = `User is login, refresh token.`;
          setAlert({isOn: true, severity:"success", text: text} as alertMessage);
          setMessages([...messages, text]);
        }
      })
      .catch((err) => {
        console.error(err)
        setAlert({isOn: true, severity:"error", text: "User is not login."} as alertMessage);
        setMessages([...messages, "User is not login."]);
      });
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
        <div style={{textAlign:"center"}}>
        <div style={{display:"inline-block"}}>
          <div style={{float:"left"}}>1. To test authentication:</div><br/>
            <div style={{marginLeft:"1rem", float:"left"}}>Email: master@ctpc.com, Password: hardpassword</div><br/>
            <div style={{marginLeft:"1rem", float:"left"}}>Email: eric@ctpc.com,   Password: strongpassword</div><br/>
            <div style={{marginLeft:"1rem", float:"left"}}>Email: young@ctpc.com,  Password: superpassword</div><br/>
          <div style={{float:"left"}}>2. To test authorization, press VERIFY LOGIN STATUS after login. The token expires in 30 second. Token is renewed when verifying.</div>
        </div>
        </div>
      </>
      <Box sx={{ flexGrow: 1 }} style={{marginTop: "3rem"}}>
        <Grid container={true} spacing={2} direction="column" alignItems="center">
          <Grid item xs={8}>
            <TextField onChange={handleEmailChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>} id="standard-basic" label="Email" variant="standard" />
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
      <div style={{textAlign:"center"}}>
        <div style={{display:"inline-block"}}>
          {messages.map((message) => <><div style={{float:"left"}}>{message}</div><br/></>)}
        </div>
      </div>
      
      {alert.isOn && <Alert severity={alert.severity} style={{position:"fixed", width:"20rem", left:"50%", top:"100%", transform:"translate(-50%,-100%)"}}>
        {alert.text}
      </Alert>}
    </div>
  );
}