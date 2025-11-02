// Load match data
async function loadJsonFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error loading JSON file:", error);
    return null;
  }
}

const teams = ['AFC Bournemouth', 'Arsenal', 'Newcastle United',
       'Manchester United', 'West Bromwich Albion', 'Leicester City',
       'Everton', 'Norwich City', 'Stoke City', 'Aston Villa',
       'Crystal Palace', 'Swansea City', 'Liverpool', 'Tottenham Hotspur',
       'Watford', 'Southampton', 'Manchester City', 'West Ham United',
       'Sunderland'];

// Populate the team selector dynamically
const team_selector = document.getElementById("team-selector");
teams.forEach(team => {
  const option = document.createElement("option");
  option.id = team.replace(/\s+/g, "-").toLowerCase();
  option.value = team;
  option.textContent = team;
  team_selector.appendChild(option);
});

const stats = [
  "Dribble",
  "Pass",
  "Pressure",
  "Shot"
];

// Creates a visualization for a specific stat
function createHeatmap(team, stat) {
  const team_name = team.replaceAll(" ", "_");
  const stat_name = stat.toLowerCase();
  const container = document.getElementById(`${stat_name}-container`);
  const heatmap = document.getElementById(`${stat_name}`);

  // Set initial size for the div
  heatmap.style.width = "100%";
  heatmap.style.height = "100%";

  // Set to gameweek 1 heatmap first
  heatmap.style.backgroundImage = `url(data/${team_name}/${stat_name}/1.png)`;
  heatmap.style.backgroundSize = "cover";
}

// Update all heatmaps
function updateAllHeatmaps(team, gameweek = 1) {
  const team_name = team.replaceAll(" ", "_");
  const match_details = document.getElementById("match-details");

  // Update match details
  if (matches && matches[team] && matches[team][gameweek]) {
    const match = matches[team][gameweek];
    match_details.textContent =
      match["home_team"] + " " + match["score"] + " - " + match["opponent_score"] + " " + match["away_team"]
      + ", " + "Gameweek " + gameweek + ", " + match["match_date"].split(" ")[0];
  }

  // Update all stat heatmaps
  stats.forEach(stat => {
    const stat_name = stat.toLowerCase();
    const container = document.getElementById(`${stat_name}-container`);
    const heatmap = document.getElementById(`${stat_name}`);

    if (gameweek === 1) {
      // Initial load, just set the background
      heatmap.style.backgroundImage = `url(data/${team_name}/${stat_name}/${gameweek}.png)`;
      heatmap.style.opacity = 1;
    } else {
      // Create overlay layer for next image
      const overlay = d3.select(container).append('div')
        .attr('class', 'layer')
        .style('background-image', `url(data/${team_name}/${stat_name}/${gameweek}.png)`)
        .style('opacity', 0);

      // Set crossfade duration
      const duration = 1000;

      overlay.transition()
        .duration(duration)
        .style('opacity', 1);

      // Add fading transition
      d3.select(heatmap)
        .transition().duration(duration)
        .style("opacity", 0)
        .on("end", () => {
          heatmap.style.backgroundImage = `url(data/${team_name}/${stat_name}/${gameweek}.png)`;
          heatmap.style.opacity = 1;

          // Remove overlay
          overlay.remove();
        });
    }
  });
}

// Load matches then initialize the visualization. We must wait for the async
// JSON load to finish before using `matches` inside heatmap.
let matches = null;
let currentTeam = "Chelsea";
let sliderInitialized = false;

(async () => {
  matches = await loadJsonFile("/data/matches.json");
  if (!matches) {
    console.error("Could not load matches.json; visualization will not initialize.");
    return;
  }
  
  // Initialize all heatmaps with Chelsea, gameweek 1
  updateAllHeatmaps("Chelsea", 1);

  // Team selector change handler
  team_selector.addEventListener('change', (e) => {
    const team = e.target.value;
    if (!team) return;
    
    currentTeam = team;
    // Reset slider to gameweek 1 for the newly selected team
    const slider = document.getElementById('gameweek-slider');
    if (slider) slider.value = 1;
    updateAllHeatmaps(team, 1);
  });

  // Slider change handler (only attach once)
  if (!sliderInitialized) {
    document.getElementById("gameweek-slider").addEventListener("change", e => {
      const gameweek = parseInt(e.target.value);
      updateAllHeatmaps(currentTeam, gameweek);
    });
    sliderInitialized = true;
  }
})();
