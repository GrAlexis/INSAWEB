import axios from 'axios'
import xml2js from 'xml2js'

const localhost = "tc405-10-11.insa-lyon.fr"
const CAS_SERVER_URL = 'https://login.insa-lyon.fr';
const SERVICE_URL = `http://${localhost}:5000/api/connexion/validate`;
const FRONTEND_HOME_URL = 'http://localhost:3000/home';

const login = async(req, res)=>{
    if (req.session.user && req.session.user.loggerIn) {
        return res.redirect(FRONTEND_HOME_URL)
    }
    const redirectUrl = `${CAS_SERVER_URL}/cas/login?service=${encodeURIComponent(SERVICE_URL)}`
    res.redirect(redirectUrl)
}

const validate = async(req,res)=>{
    const ticket = req.query.ticket

    if (!ticket){
        return res.status(400).send('No ticket')
    }

    try {
        //Making GET request to CAS server for ticket validation
        //GAMBERGE : Si la verification de ticket ne fonctionne pas (ce qui risque fortement d'arriver car le service sera pas enregistré sur le serveur CAS)
        //Nik on verifie juste si y'a un ticket dans la reponse et si oui l'utilisateur est authentifié sinon non
        const response = await axios.get(`${CAS_SERVER_URL}/serviceValidate`,{
            params :{
                service: SERVICE_URL,
                ticket: ticket
            }
        })
        const data = response.data;
        // Parse the XML response
    xml2js.parseString(data, (err, result) => {
        if (err) {
          return res.status(500).send('Failed to parse CAS response');
        }
  
        if (result['cas:serviceResponse']['cas:authenticationSuccess']) {
          req.session.user = { loggedIn: true };  // Set session
          res.redirect(FRONTEND_DASHBOARD_URL);  // Redirect to frontend dashboard
        } else {
          const failure = result['cas:serviceResponse']['cas:authenticationFailure'];
          const errorMessage = failure && failure[0]._ || 'Authentication failed';
          res.status(401).send(errorMessage);
        }
      });
    } catch (error) {
      res.status(500).send('CAS validation failed');
    }
}

module.exports= {
    login,
    validate
}