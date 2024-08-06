import './Profil.css';
import Animation from '../Animation';
import Roulant from './Roulant';

function Profil() {

  return (
    <Animation>
      <Roulant></Roulant>
    <div className="profil">
      <header className="profil-header">
        <h1>Hello, TOM ur account is ready!</h1>
      </header>
    </div>
    </Animation>
  );
}

export default Profil;
