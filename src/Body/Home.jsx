function Home() {
  return (
    <div>
      {/* Featured Specialists Section */}
      <div className="container px-4 py-5" id="featured-specialists">
        <div>
          <img
            src="logo.png"
            alt="Logo"
            width="300"
            height="150"
            style={{ marginBottom: "60px", marginTop: "20px" }}
          />
        </div>
        <h2 className="pb-2 border-bottom">Featured Specialists</h2>

        <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-5">
          {[
            {
              title: "General Physicians",
              img: "physician.jpg",
            },
            {
              title: "Dentists",
              img: "dentist.jpg",
            },
            {
              title: "Cardiologists",
              img: "cardiologists.jpg",
            },
          ].map((specialist, index) => (
            <div className="col" key={index}>
              <div
                className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
                style={{
                  backgroundImage: `url('${specialist.img}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  backgroundBlendMode: "overlay",
                }}
              >
                <div className="d-flex flex-column h-100 p-6 pb-3 text-white text-shadow-1">
                  <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                    {specialist.title}
                  </h3>
                  <ul className="d-flex list-unstyled mt-auto">
                    <li className="me-auto"></li>
                    <li className="d-flex align-items-center me-3">
                      <svg className="bi me-2" width="1em" height="1em">
                        <use xlinkHref="#geo-fill"></use>
                      </svg>
                      <small>{specialist.location}</small>
                    </li>
                    <li className="d-flex align-items-center">
                      <svg className="bi me-2" width="1em" height="1em">
                        <use xlinkHref="#calendar3"></use>
                      </svg>
                      <small>{specialist.days}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
        <h5 className="pb-2 underline">
          <a href="#">More</a>
        </h5>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-5" id="features">
        <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
          {[
            {
              title: "Find Top Doctors",
              desc: "Search and connect with expert doctors in your area or globally. Verified profiles ensure trusted healthcare.",
              icon: "#collection",
              link: "Explore Now",
            },
            {
              title: "Book Appointments",
              desc: "Schedule appointments easily with just a few clicks. Choose a convenient time that works for you.",
              icon: "#people-circle",
              link: "Book Now",
            },
            {
              title: "24/7 Healthcare Access",
              desc: "Get healthcare support anytime, anywhere. Connect with doctors online or in-person at your convenience.",
              icon: "#toggles2",
              link: "Learn More",
            },
          ].map((feature, index) => (
            <div className="feature col" key={index}>
              <div className="feature-icon d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3">
                <svg className="bi" width="1em" height="1em">
                  <use xlinkHref={feature.icon}></use>
                </svg>
              </div>
              <h3 className="fs-2 text-body-emphasis">{feature.title}</h3>
              <p>{feature.desc}</p>
              <a href="#" className="icon-link">
                {feature.link}
                <svg className="bi">
                  <use xlinkHref="#chevron-right"></use>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* User Benefits Section */}
      <div className="container px-4 py-5" id="user-benefits">
        <h2 className="pb-2 border-bottom">User Benefits</h2>

        <div className="row row-cols-1 row-cols-lg-3 align-items-stretch g-4 py-5">
          {[
            {
              title: "Verified Doctors",
              img: "verified.jpg",
            },
            {
              title: "Global Access",
              img: "globe.jpg",
            },
            {
              title: "24*7 Booking",
              img: "24*7.jpg",
            },
          ].map((benefit, index) => (
            <div className="col" key={index}>
              <div
                className="card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow-lg"
                style={{
                  backgroundImage: `url('${benefit.img}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  backgroundBlendMode: "overlay",
                }}
              >
                <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
                  <h3 className="pt-5 mt-5 mb-4 display-6 lh-1 fw-bold">
                    {benefit.title}
                  </h3>
                  <ul className="d-flex list-unstyled mt-auto">
                    <li className="me-auto"></li>
                    <li className="d-flex align-items-center me-3">
                      <svg className="bi me-2" width="1em" height="1em">
                        <use xlinkHref="#geo-fill"></use>
                      </svg>
                      <small>{benefit.location}</small>
                    </li>
                    <li className="d-flex align-items-center">
                      <svg className="bi me-2" width="1em" height="1em">
                        <use xlinkHref="#calendar3"></use>
                      </svg>
                      <small>{benefit.days}</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
