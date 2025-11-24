const API_TOKEN = "e062e063a0aa1a65708306581d969c011a8519a6";

document.addEventListener("DOMContentLoaded", () => {
  const gerarBtn = document.getElementById("gerar");
  const relatorioDiv = document.getElementById("relatorio");

  if (gerarBtn) {
    gerarBtn.addEventListener("click", async () => {
      const estado = document.getElementById("estado").value;

      if (!estado) {
        relatorioDiv.innerHTML = "<p style='color:red'>Por favor, selecione um local.</p>";
        return;
      }

      try {
        // Estados com dados confiáveis
        const mapEstadoParaCidade = {
          "RJ": "sao-paulo",
          "SP": "rio-de-janeiro",
          "DF": "brasilia",

          "USA-NY": "new-york",
          "USA-CA": "los-angeles",
          "USA-FL": "miami",
          "USA-TX": "houston",

          "FR": "paris",

          "JP": "tokyo",
          "JP-OSK": "osaka",

          "AU-NSW": "sydney",
          "AU-VIC": "melbourne",

          "MX": "mexico-city"
        };

        const cidade = mapEstadoParaCidade[estado];
        if (!cidade) throw new Error("Cidade não mapeada para este estado.");

        const url = `https://api.waqi.info/feed/${cidade}/?token=${API_TOKEN}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.status !== "ok") throw new Error("Erro ao obter dados da API.");

        const aqi = data.data.aqi;
        const dominantes = data.data.dominentpol || "ND";

        const qualidadeAr = (() => {
          if (aqi <= 50) return "Boa";
          if (aqi <= 100) return "Moderada";
          if (aqi <= 150) return "Ruim";
          if (aqi <= 200) return "Muito Ruim";
          return "Péssima";
        })();

        const texto = `
          <h3>Relatório de Qualidade do Ar - ${estado}</h3>
          <p><b>Índice AQI:</b> ${aqi}</p>
          <p><b>Qualidade do ar:</b> ${qualidadeAr}</p>
          <p><b>Poluente predominante:</b> ${dominantes}</p>
          <p>Dados reais fornecidos pela estação de ${cidade.replace(/-/g," ")} via API AQICN.</p>
        `;

        relatorioDiv.innerHTML = texto;
        relatorioDiv.style.background = "#e8f5e9";
        relatorioDiv.style.padding = "20px";
        relatorioDiv.style.borderRadius = "10px";
        relatorioDiv.style.marginTop = "20px";

      } catch (err) {
        relatorioDiv.innerHTML = `<p style='color:red'>Erro: ${err.message}</p>`;
      }
    });
  }
});
