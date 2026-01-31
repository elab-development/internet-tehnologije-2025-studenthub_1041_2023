import Breadcrumbs from '../reusable/Breadcrumbs';

function HomeSluzbenik() {
  return (
    <div className="home">
      <h1>Dobrodošli u Službeničku sekciju</h1>

      <Breadcrumbs
        items={[
          { label: 'Početna', link: '/sluzbenik/home' }
        ]}
      />

      <p>Ovde možete pregledati i upravljati studentima, predmetima i prijavama ispita.</p>

      <div className="cards-container">
        <div className="card">
          <img src="/faks.jpg" alt="Fakultet" className="card-image" />
          <h3>O Fakultetu</h3>
          <p>
            Fakultet pruža kvalitetno obrazovanje i mogućnosti za lični i profesionalni razvoj.
          </p>
        </div>

        <div className="card">
          <img src="/studenti.jpg" alt="Studenti" className="card-image" />
          <h3>O Studentima</h3>
          <p>
            Studenti su srce fakulteta – ovde se neguje njihova kreativnost, rad i zajedništvo.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeSluzbenik;

