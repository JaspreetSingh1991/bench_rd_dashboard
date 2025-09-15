import React, { useRef, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Link,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function DemandDashboard() {
  const fileInputRef = useRef(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [techReject, setTechReject] = useState(0);
  const [techRejectLen, setTechRejectLen] = useState(0);
  const [screenReject, setScreenReject] = useState(0);
  const [screenRejectLen, setScreenRejectLen] = useState(0);
  const [ageDemand, setAgeDemand] = useState(0);
  const [ageDemandLen, setAgeDemandLen] = useState(0);

  useEffect(() => {
    if (uploadedData) {
      //alert("hi")
      console.log("uploadedData", uploadedData)
      const filteredTechReject = uploadedData.filter((item) => item["Task Type"]==="MISSION" &&
      item["Client Interview"]?.trim() === "No");
      setTechReject(filteredTechReject);
      setTechRejectLen(filteredTechReject.length);

      const filteredScreenReject = uploadedData.filter((item) => item["Task Type"]==="MISSION_PRESALES" &&
      item["Client Interview"]?.trim() === "No");
      setScreenReject(filteredScreenReject);
      setScreenRejectLen(filteredScreenReject.length);

      const filteredAgeDemand = uploadedData.filter((item) => item["Task Ageing"]==="120+" ||
      item["Task Ageing"]?.trim() === "91 to 120");
      setAgeDemand(filteredAgeDemand);
      setAgeDemandLen(filteredAgeDemand.length);

    }
  }, [uploadedData]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate file type (only JSON allowed)
    if (file.type !== "application/json") {
      alert("Please upload a valid JSON file.");
      return;
    }

    try {
      // ✅ Read the file as text
      const text = await file.text();

      //console.log("Uploaded text:", text);

      // ✅ Parse JSON
      const jsonData = JSON.parse(text);

      console.log("Uploaded JSON:", jsonData);
      setUploadedData(jsonData); // You can pass this to tables later

      alert("JSON file uploaded successfully!");
    } catch (error) {
      alert("Invalid JSON file.");
      console.error("Error reading file:", error);
    }
  };
  return (
    <>
    <AppBar position="static" color="primary" style={{ paddingLeft: '70px' }}>
      <Toolbar>
        {/* Left Side - Brand */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Demand Dashboard
        </Typography>
        
        {/* Right Side - Upload Button */}
        <Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUploadClick}
          >
            📤 Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }} // replaces Bootstrap's d-none
            accept=".json"
          />
        </Box>
      </Toolbar>
    </AppBar>
    
    <Container maxWidth="xxl" sx={{ pl: "70px", my: 4 }} style={{ paddingLeft: '70px' }}>
      <Grid container spacing={3}>
        {/* Card 1 */}
        <Grid item size={3}>
          <Card
            sx={{
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 2,
              height: 100
            }}
          >
            <CardContent>
              <Typography variant="h6">
                Mission + Customer Interview No
              </Typography>
              <Typography variant="h4">{techRejectLen}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2 */}
        <Grid item size={3}>
          <Card
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              boxShadow: 2,
              height: 100
            }}
          >
            <CardContent>
              <Typography variant="h6">
                PRESALES + Customer Interview No
              </Typography>
              <Typography variant="h4">{screenRejectLen}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3 */}
        <Grid item size={3}>
          <Card
            sx={{
              bgcolor: "error.main",
              color: "white",
              boxShadow: 2,
              height: 100
            }}
          >
            <CardContent>
              <Typography variant="h6">Demand &gt; 90</Typography>
              <Typography variant="h4">{ageDemandLen}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4 */}
        <Grid item size={3}>
          <Card
            sx={{
              bgcolor: "warning.main",
              color: "white",
              boxShadow: 2,
              height: 100
            }}
          >
            <CardContent>
              <Typography variant="h6">Test Count 2</Typography>
              <Typography variant="h4">99</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
    <Container maxWidth="xxl" sx={{ pl: "70px", my: 4 }} style={{ paddingLeft: '70px' }}>
      <Grid container spacing={3}>
      {/* Left Table */}
      <Grid item size={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 300, overflowY: "auto" }}
            >
              {/* Title Header */}
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        backgroundColor: "grey.900",
                        color: "white",
                        fontWeight: "bold",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                    >
                      Mission + Customer Interview No
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "primary.light" }}>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ width: 150 }}>Task Name</TableCell>
                    <TableCell>Task Code</TableCell>
                    <TableCell>Task Ageing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techReject.length > 0 ? (
                    techReject.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item["Task Name"]}</TableCell>
                        <TableCell>{item["Task Code"]}</TableCell>
                        <TableCell>{item["Task Type"]}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Table */}
      <Grid item  size={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 300, overflowY: "auto" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        backgroundColor: "grey.900",
                        color: "white",
                        fontWeight: "bold",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                    >
                      PRESALES + Customer Interview No
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: "warning.light" }}>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ width: 150 }}>Task Name</TableCell>
                    <TableCell>Task Code</TableCell>
                    <TableCell>Task Ageing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techReject.length > 0 ? (
                    techReject.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item["Task Name"]}</TableCell>
                        <TableCell>{item["Task Code"]}</TableCell>
                        <TableCell>{item["Task Type"]}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid> <br/>
    <Grid container spacing={3}>
      {/* Left Table - Demand > 90 days */}
      <Grid item size={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 300, overflowY: "auto" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  {/* Title Header */}
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        backgroundColor: "grey.900",
                        color: "white",
                        fontWeight: "bold",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                    >
                      Demand &gt; 90 days
                    </TableCell>
                  </TableRow>
                  {/* Column Headers */}
                  <TableRow sx={{ backgroundColor: "primary.light" }}>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ width: 150 }}>Task Name</TableCell>
                    <TableCell>Task Code</TableCell>
                    <TableCell>Task Ageing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ageDemand.length > 0 ? (
                    ageDemand.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item["Task Name"]}</TableCell>
                        <TableCell>{item["Task Code"]}</TableCell>
                        <TableCell>{item["Task Type"]}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Table - PRESALES */}
      <Grid item size={6}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 300, overflowY: "auto" }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  {/* Title Header */}
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        backgroundColor: "grey.900",
                        color: "white",
                        fontWeight: "bold",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                      }}
                    >
                      PRESALES + Customer Interview No
                    </TableCell>
                  </TableRow>
                  {/* Column Headers */}
                  <TableRow sx={{ backgroundColor: "warning.light" }}>
                    <TableCell>#</TableCell>
                    <TableCell sx={{ width: 150 }}>Task Name</TableCell>
                    <TableCell>Task Code</TableCell>
                    <TableCell>Task Ageing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {techReject.length > 0 ? (
                    techReject.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item["Task Name"]}</TableCell>
                        <TableCell>{item["Task Code"]}</TableCell>
                        <TableCell>{item["Task Type"]}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Container>
    </>
  );
}