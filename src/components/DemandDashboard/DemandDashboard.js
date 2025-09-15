import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Navbar, Nav, Table } from "react-bootstrap";
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
    <Navbar bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand href="#home">Demand Dashboard</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Help</Nav.Link>
          </Nav>
          {/* Right Side Button */}
          <div className="ms-auto">
            <Button variant="primary" onClick={handleUploadClick}>
              📤 Upload
            </Button>
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="d-none"
              accept=".json"
            />
          </div>
        </Container>
      </Navbar>
    <Container fluid style={{ paddingLeft: '70px' }} className="my-4">
       
      <Row className="g-3">
        {/* Card 1 */}
        <Col xs={12} md={6} lg={3}>
          <Card className="h-60 shadow-sm" bg="primary" text="white">
            <Card.Body >
              <Card.Title>Mission + Customer Interview No</Card.Title>
              <Card.Text>
                {techRejectLen}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 2 */}
        <Col xs={12} md={6} lg={3}>
          <Card className="h-60 shadow-sm" bg="secondary" text="white">
            <Card.Body>
              <Card.Title>PRESALES + Customer Interview No</Card.Title>
              <Card.Text>
                {screenRejectLen}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 3 */}
        <Col xs={12} md={6} lg={3}>
          <Card className="h-60 shadow-sm" bg="danger" text="white">
            <Card.Body>
              <Card.Title>Demand &gt; 90</Card.Title>
              <Card.Text>
                {ageDemandLen}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Card 4 */}
        <Col xs={12} md={6} lg={3}>
          <Card className="h-60 shadow-sm" bg="warning" text="white">
            <Card.Body>
              <Card.Title>Test Count 2</Card.Title>
              <Card.Text>
                99
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
       
    </Container>
    <Container fluid style={{ paddingLeft: '70px' }} className="my-4">
      <Row className="g-3">
        {/* Table 1 */}
        <Col xs={12} lg={6}>
          <Card className="h-60 shadow-sm">
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover size="sm">
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                   <th colSpan={4} className="text-center">
                    Mission + Customer Interview No
                  </th>
                </tr>
              </thead>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th style={{ width: "150px" }}>Task Name</th>
                  <th>Task Code</th>
                  <th>Task Ageing</th>
                </tr>
              </thead>
              <tbody>
                {techReject.length > 0 ? (
                  techReject.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item["Task Name"]}</td>
                      <td>{item["Task Code"]}</td>
                      <td>{item["Task Type"]}</td>                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No records found 
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          </Card>
        </Col>

        {/* Table 2 */}
        <Col xs={12} lg={6}>
          <Card className="h-60 shadow-sm">
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover size="sm">
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                   <th colSpan={4} className="text-center">
                    PRESALES + Customer Interview No
                  </th>
                </tr>
              </thead>
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th style={{ width: "150px" }}>Task Name</th>
                  <th>Task Code</th>
                  <th>Task Ageing</th>
                </tr>
              </thead>
              <tbody>
                {techReject.length > 0 ? (
                  techReject.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item["Task Name"]}</td>
                      <td>{item["Task Code"]}</td>
                      <td>{item["Task Type"]}</td>                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No records found 
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          </Card>
        </Col>        
      </Row> <br/>
      <Row className="g-3">
        {/* Table 1 */}
        <Col xs={12} lg={6}>
          <Card className="h-60 shadow-sm">
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover size="sm">
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                   <th colSpan={4} className="text-center">
                    Demand &gt; 90 days
                  </th>
                </tr>
              </thead>
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th style={{ width: "150px" }}>Task Name</th>
                  <th>Task Code</th>
                  <th>Task Ageing</th>
                </tr>
              </thead>
              <tbody>
                {ageDemand.length > 0 ? (
                  ageDemand.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item["Task Name"]}</td>
                      <td>{item["Task Code"]}</td>
                      <td>{item["Task Type"]}</td>                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No records found 
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          </Card>
        </Col>

        {/* Table 2 */}
        <Col xs={12} lg={6}>
          <Card className="h-60 shadow-sm">
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover size="sm">
              <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr>
                   <th colSpan={4} className="text-center">
                    PRESALES + Customer Interview No
                  </th>
                </tr>
              </thead>
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th style={{ width: "150px" }}>Task Name</th>
                  <th>Task Code</th>
                  <th>Task Ageing</th>
                </tr>
              </thead>
              <tbody>
                {techReject.length > 0 ? (
                  techReject.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item["Task Name"]}</td>
                      <td>{item["Task Code"]}</td>
                      <td>{item["Task Type"]}</td>                    
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No records found 
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            </div>
          </Card>
        </Col>        
      </Row>
    </Container>
    </>
  );
}