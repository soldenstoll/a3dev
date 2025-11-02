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

const teams = [
  "Arsenal",
  "Aston Villa",
  "Bournemouth",
  "Chelsea",
  "Crystal Palace",
  "Everton",
  "Leicester City",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Newcastle United",
  "Norwich City",
  "Southampton",
  "Stoke City",
  "Sunderland",
  "Swansea City",
  "Tottenham Hotspur",
  "Watford",
  "West Bromwich Albion",
  "West Ham United"
];

// Populate the team selector dynamically
const selector = document.getElementById("team-selector");
teams.forEach(team => {
  const option = document.createElement("option");
  option.id = team.replace(/\s+/g, "-").toLowerCase();
  option.value = team;
  option.textContent = team;
  selector.appendChild(option);
});

function getTeam() {
  const selector = document.getElementById("team-selector");
  selector.addEventListener("change", e => {
    const team = e.target.value;
    console.log("Selected team:", team);
  });
}


// Creates a visualization 
function heatmap(team) {
    const pressure = document.getElementById("pressure")
    const match_details = document.getElementById("match-details")
    const team_name = team.replaceAll(" ", "_")

    // Set gameweek 1 data for match_details
    match = matches[team_name][1]
    match_details.textContent = 
        match["home_team"] + " " + match["score"] + " - " + match["opponent_score"] + " " + match["away_team"]
        + ", " + "Gameweek 1" + ", " + match["match_date"].split(" ")[0]

    // Set initial size for the div
    pressure.style.width = "600px"
    pressure.style.height = "400px"
    
    // Set to gameweek 1 heatmap first
    pressure.style.backgroundImage = `url(data/${team_name}/pressure/1.png)`
    pressure.style.backgroundSize = "cover"

    // Listen for slider changes
    document.getElementById("gameweek-slider").addEventListener("change", e => {
        let gameweek = e.target.value;

        // Create overlay layer for next image
        const overlay = container.append('div')
          .attr('class', 'layer')
          .style('background-image', `url(data/${team_name}/pressure/${gameweek}.png)`)
          .style('opacity', 0);
          
        // Upate match details
        match = matches[team_name][gameweek]
        match_details.textContent = 
            match["home_team"] + " " + match["score"] + " - " + match["opponent_score"] + " " + match["away_team"]
            + ", " + "Gameweek " + gameweek + ", " + match["match_date"].split(" ")[0]

        // Set crossfade duration
        const duration = 300;

        overlay.transition()
          .duration(duration)
          .style('opacity', 1);
          
        // Add fading transition
        d3.select(pressure)
            .transition().duration(duration)
            .style("opacity", 0)
            .on("end", () => {
                pressure.style.backgroundImage = `url(data/${team_name}/pressure/${gameweek}.png)`
                pressure.style.opacity = 1

                // Remove overlay
                overlay.remove()
            })
    })
    return pressure
}

// Load matches then initialize the visualization. We must wait for the async
// JSON load to finish before using `matches` inside heatmap.
let matches = null;
(async () => {
  matches = await loadJsonFile("/data/matches.json");
  if (!matches) {
    console.error("Could not load matches.json; visualization will not initialize.");
    return;
  }

  // Now that matches is loaded, create the heatmap and append its element.
  const maps = heatmap("Chelsea");
  document.getElementById("visualization-container").appendChild(maps);
})();
