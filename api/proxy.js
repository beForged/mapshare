
const axios = require('axios');

module.exports = async (req, res) => {
  const { url, method, headers, data } = req.body;

  try {
    const response = await axios({
      method: method || 'GET',
      url,
      headers,
      data
    });

      console.log("proxy req: ", response);
      res.status(200).json(response.data);
  } catch (error) {
      console.error("error: ", error)
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
