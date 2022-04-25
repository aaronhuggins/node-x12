const color = "17f384";
const names = [
  "version_major",
  "version_minor",
  "version_patch",
  "version_premajor",
  "version_preminor",
  "version_prepatch",
  "version_prerelease",
];
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const user = Deno.env.get("GITHUB_USER");
const repo = Deno.env.get("GITHUB_REPO");

console.log(`Creating labels for: ${user}/${repo}`);

if (GITHUB_TOKEN) {
  for (const name of names) {
    const label = JSON.stringify({ name, color });
    const response = await fetch(
      `https://api.github.com/repos/${user}/${repo}/labels`,
      {
        method: "POST",
        body: label,
        headers: {
          "content-type": "application/json",
          "Authorization": `token ${GITHUB_TOKEN}`,
        },
      },
    );

    if (response.ok && response.status === 201) {
      console.log(`Label success: ${label}`);
    } else {
      console.log(
        `Label failed (status ${response.status} ${response.statusText}): ${label}`,
      );
    }
  }
} else {
  console.log("Labels all failed: Github token empty");
}
