import React from 'react';
//import './HomePage.css';
import NavHome from '../NavHome/NavHome';
import { Link } from 'react-scroll';
import tristan from '../../assets/ceo/TristanV.jpg';
import mika from '../../assets/ceo/MikaR.JPG';
import tom from '../../assets/ceo/tomG.jpeg';
import alexis from '../../assets/ceo/AlexisG.jpeg';



const HomePage = () => {
  return (
    <div className="home-container">
      <NavHome />
      <div className="overlay">
        <div className="text-content">
          <h1>
            <span className="highlight">Transformez</span> chaque événement<br /> en une aventure collective<br /> inoubliable
          </h1>
          <Link
            to="about"
            smooth={true}
            duration={1500} // Durée en millisecondes
            className="cta-button"
          >
            Découvrez notre Agence
          </Link>
        </div>
      </div>

      {/* Section "Qui sommes-nous" */}
      <section className="about-section" id="about">
        <h2>Qui sommes-nous ?</h2>
        <p>
        Nous sommes une équipe de 4 étudiants en école d’ingénieur à l'INSA Lyon. 
        Nous avons réuni nos compétences pour développer Sheeesh. 
        unis par un même objectif : améliorer le bien-être au travail grâce à des solutions interactives et engageantes. 
        </p>
      </section>

      {/* Effet de parallaxe */}
      <div className="team">
      <h2>Notre équipe</h2>

      <div className="team-members">
        <div className="member-card">
          <div className="member-photo">
          <img src={tristan} alt="Logo" className="id" />
          </div>
          <p>Tristan Verdet</p>
        </div>
        <div className="member-card">
          <div className="member-photo">
          <img src={mika} alt="Logo" className="id" />
          </div>
          <p>Michaël Richaud</p>
        </div>
        <div className="member-card">
          <div className="member-photo">
          <img src={tom} alt="Logo" className="id" />
          </div>
          <p>Tom Goarin</p>
        </div>
        <div className="member-card">
          <div className="member-photo">
          <img src={alexis} alt="Logo" className="id" />
          </div>
          <p>Alexis Graul</p>
        </div>
      </div>

      </div>

      {/* Section suivante */}
      <section className="services-section">
        <h2>Nos services</h2>
        <p>Des solutions personnalisées pour rendre chaque événement unique et inoubliable.</p>
      </section>
    </div>
  );
};

export default HomePage;
