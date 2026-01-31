import axios from 'axios';

const usePdfExport = () => {
  const exportPdf = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/student/pdf', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      });

      alert("Uspešno! PDF će biti preuzet uskoro.");
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'izvestaj-studenta.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Greška pri preuzimanju PDF izveštaja.');
      console.error(error);
    }
  };

  return exportPdf;
};

export default usePdfExport;