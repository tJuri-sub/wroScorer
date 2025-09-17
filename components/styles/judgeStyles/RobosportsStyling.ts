import { StyleSheet } from 'react-native';

const robostyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#432344',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createGameButton: {
    backgroundColor: '#432344',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  gamesHeader: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 15,
    color: '#432344',
  },
  gameCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gameNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#432344',
    marginBottom: 5,
  },
  teamsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  gameDetails: {
    marginTop: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#666',
    marginBottom: 5,
  },
  matchResults: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  finalResult: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#388e3c',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center' as const,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic' as const,
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 20,
    color: '#432344',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    color: '#432344',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
  },
  modalButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#432344',
    flex: 1,
    alignItems: 'center' as const,
  },
  cancelButtonText: {
    color: '#432344',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  createButton: {
    backgroundColor: '#432344',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center' as const,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center' as const,
    marginBottom: 20,
    color: '#666',
    fontWeight: '600' as const,
  },
  teamSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 15,
    color: '#432344',
  },
  ballCounterRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 15,
  },
  ballCounter: {
    flex: 1,
    alignItems: 'center' as const,
    marginHorizontal: 10,
  },
  ballLabel: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  ballCount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
    color: '#432344',
  },
  counterButtons: {
    flexDirection: 'row' as const,
  },
  counterButton: {
    backgroundColor: '#ddd',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    minWidth: 40,
    alignItems: 'center' as const,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  ballScore: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    color: '#388e3c',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginVertical: 10,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  },
  violationSection: {
    marginVertical: 20,
  },
  violationButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 10,
  },
  violationButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center' as const,
  },
  violationButtonText: {
    color: 'white',
    fontWeight: 'bold' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 15,
    color: '#432344',
  },
  resultsSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
  },
  finishButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 20,
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#432344',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Tournament Selection
  tournamentSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tournamentCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tournamentCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tournamentInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tournamentStatus: {
    fontSize: 12,
    color: '#888',
  },

  // Tournament Match Cards
  tournamentMatchCard: {
    backgroundColor: '#fff9c4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0c814',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#432344',
    marginBottom: 8,
  },
  matchStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  // Tournament Setup Styles
  inputSection: {
    marginBottom: 20,
  },

  tournalabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  
});


export default robostyles;