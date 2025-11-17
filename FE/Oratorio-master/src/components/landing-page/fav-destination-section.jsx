import React, { useEffect, useState } from "react";
import DestinationCard from "./destination-section";
import "./fav-destination-section.css";

function FavoriteDestinationsSection() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/destinations")
      .then((res) => res.json())
      .then((data) => setDestinations(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  return (
    <section className="fav-destinations-section">
      <div className="section-container">
        <h2 className="section-title">Destinasi Favorit</h2>

        <div className="destinations-grid">
          {destinations.map((item, index) => (
            <DestinationCard
              key={index}
              name={item.name}
              imageSrc={item.image_url}
              location={item.location}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FavoriteDestinationsSection;
