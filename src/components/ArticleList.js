import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ArticleList = () => {
  const { companyId } = useParams();
  const { auth } = useContext(AuthContext);

  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const sendPdfByEmail = async () => {
    // Crear el PDF
    const doc = new jsPDF();
    const headers = [['ID', 'Name', 'Price', 'Quantity']];
    const data = articles.map((article) => [
      article.id,
      article.name,
      article.price,
      article.quantity,
    ]);

    doc.autoTable({
      head: headers,
      body: data,
    });

    const pdfBase64 = doc.output('datauristring');

    // Configurar los datos para enviar el correo
    const emailData = {
      from_email: 'ddimela9no@gmail.com',
      to_email: 'ddimela9no@gmail.com',
      pdf_data: pdfBase64,
    };

    try {
      // Enviar el correo
      await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailData, 'YOUR_USER_ID');
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/companies/${companyId}/articles/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los artículos');
      }

      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error al obtener los artículos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/companies/${companyId}/articles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name, price, quantity }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el artículo');
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      setShowModal(false);
      fetchArticles();
    } catch (error) {
      console.error('Error al guardar el artículo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    const tableHeaders = ['ID', 'Name', 'Price', 'Quantity'];
    const tableData = articles.map(article => [article.id, article.name, article.price, article.quantity]);
    doc.autoTable({ head: [tableHeaders], body: tableData });
    doc.save(`Articles-Company-${companyId}.pdf`);
  };

  return (
    <Container>
      <h2 className='mt-5 mb-4'>Article List for Company {companyId}</h2>
      <Button className='mb-4' onClick={() => setShowModal(true)}>
        Add Article
      </Button>{' '}
      <Button className='mb-4' onClick={exportToPdf}>
        Export to PDF
      </Button>{' '}
      <Button className='mb-4' onClick={sendPdfByEmail}>
        Send PDF by Email
      </Button>
      {error && (
        <Alert variant='danger' onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant='success' onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}
      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      )}
      {showSuccessAlert && (
        <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
          Artículo agregado exitosamente.
        </Alert>
      )}
      {articles.length ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td>{article.name}</td>
                <td>{article.price}</td>
                <td>{article.quantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No articles found</p>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId='name'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId='price'>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type='number'
                step='0.01'
                placeholder='Enter Price'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId='quantity'>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter Quantity'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>

            <Button variant='primary' type='submit'>
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal >
    </Container >
  );
};

export default ArticleList;
