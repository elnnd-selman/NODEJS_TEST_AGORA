require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Agora Token Server is running...");
});

app.post("/agora/token", (req, res) => {
  try {
    const { channelName, uid } = req.body;
    if (!channelName || uid == null) {
      return res.status(400).json({ error: "Missing channelName or uid" });
    }

    const uidInt = parseInt(uid, 10);
    if (isNaN(uidInt) || uidInt <= 0) {
      return res.status(400).json({ error: "Invalid uid" });
    }

    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    if (!appID || !appCertificate) {
      return res.status(500).json({
        error: "AGORA_APP_ID or AGORA_APP_CERTIFICATE not set in .env",
      });
    }

    // Token valid for 1 hour
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uidInt,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    console.log(`Generated token for channel=${channelName}, uid=${uidInt} => ${token}`);
    return res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
