function syncToGitHub() {
  try {
    // 1. Ensure configuration exists
    const pat = PropertiesService.getScriptProperties().getProperty('GITHUB_PAT');
    if (!pat) throw new Error("GitHub PAT not configured - Run setup() first");
    
    // 2. Get and transform data
    const data = transformData(getSheetData());
    if (!data.length) throw new Error("No data found in sheet");
    
    // 3. Create file if doesn't exist
    const githubUrl = `https://api.github.com/repos/seskhobor/seskhobor/contents/data/news.json`;
    const options = {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github+json'
      },
      payload: JSON.stringify({
        message: 'Initial news data commit',
        content: Utilities.base64Encode(JSON.stringify(data)),
        branch: 'main'
      }),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(githubUrl, options);
    
    if (response.getResponseCode() === 201) {
      Logger.log("✅ Successfully created news.json");
    } else if (response.getResponseCode() === 200) {
      Logger.log("✅ Successfully updated news.json"); 
    } else {
      throw new Error(`GitHub Error: ${response.getContentText()}`);
    }
    
  } catch (e) {
    Logger.log("❌ Error: " + e.message);
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 
                    "Sync Failed", 
                    e.message);
  }
}