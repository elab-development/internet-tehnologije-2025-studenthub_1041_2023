import usePdfExport from "../hooks/usePdfExport";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

function Home() {
  
   const handleExportPDF = usePdfExport();

    Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
      const fetchMetrics = async () => {
        try {
          const token = sessionStorage.getItem('access_token');
          const res = await axios.get('http://127.0.0.1:8000/api/student/metrike', {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
          setMetrics(res.data);
        } catch (e) {
          console.error('Greška pri dohvatanju metrika', e);
        }
      };

      fetchMetrics();
    }, []);

  return (
    <div className="home">
      <h1>Dobrodošli u Examify za studente</h1>
      <p>Ovde možete pregledati sve predmete, prijaviti ispit i videti detaljnije metrike.</p>

      <div className="cards-container">
        <div className="card">
          <img src="/prezentacija.jpg" alt="Prezentacija" className="card-image" />
          <h3>O Prezentacijama</h3>
          <p>
            Prezentacije na fakultetu pružaju pregled ključnih oblasti i održavaju se na mesečnom nivou.
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
      <div className="pdf-card">
          <h3>Izveštaj o ispitima</h3>
          <p>
            Preuzmite PDF izveštaj o vašim prijavama, prosečnoj oceni i broju položenih ispita.
          </p>
          <button onClick={handleExportPDF} className="btn-primary">
            Preuzmi PDF
          </button>
        </div>

        {metrics && (
        <div className="dashboard-metrics">
          <h1 className="dashboard-title"> Statistika i Metrike</h1>
          <p>Vas detaljan pregled statistika </p>

          <div className="dashboard-grid">
            <div className="metric-box">
              <h3>{metrics.ukupno_prijava}</h3>
              <p>Ukupno prijava</p>
            </div>
            <div className="metric-box green">
              <h3>{metrics.polozeni}</h3>
              <p>Položeni ispiti</p>
            </div>
            <div className="metric-box red">
              <h3>{metrics.nepolozeni}</h3>
              <p>Nepoloženi</p>
            </div>
            <div className="metric-box gray">
              <h3>{metrics.neocenjeni}</h3>
              <p>Bez ocene</p>
            </div>
            <div className="metric-box blue">
              <h3>{metrics.broj_predmeta_koje_slusa}</h3>
              <p>Predmeta koje sluša</p>
            </div>
            <div className="metric-box orange">
              <h3>{metrics.broj_desetki}</h3>
              <p>Broj desetki</p>
            </div>
            <div className="metric-box purple">
              <h3>{metrics.polozeni_iz_prvog}</h3>
              <p>Položeni iz prvog puta</p>
            </div>
            <div className="metric-box gold" style={{ gridColumn: 'span 2' }}>
              <h3>{metrics.najcesce_prijavljivan_predmet || '–'}</h3>
              <p>Najčešće prijavljivan predmet ({metrics.najcesce_prijava_broj}x)</p>
            </div>
          </div>

              <div className="chart-section">
                <div className="chart-box">
                  <h4> Prijave po godinama</h4>
                  <Bar
                    data={{
                      labels: Object.keys(metrics.po_godinama),
                      datasets: [{
                        label: 'Broj prijava',
                        data: Object.values(metrics.po_godinama),
                        backgroundColor: '#4e79a7',
                      }],
                    }}
                    options={{ responsive: true }}
                  />
                </div>

                <div className="chart-box">
                  <h4> Prijave po rokovima</h4>
                  <Doughnut
                    data={{
                      labels: Object.keys(metrics.po_rokovima),
                      datasets: [{
                        data: Object.values(metrics.po_rokovima),
                        backgroundColor: ['#71ae68ff', '#f28e2c', '#e15759', '#76b7b2', '#8394d1ff', '#af7aa1'],
                      }],
                    }}
                    options={{ responsive: true }}
                  />
                </div>
              </div>
            </div>)}
    </div>
  );
}

export default Home;
