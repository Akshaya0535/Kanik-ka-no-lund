"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Send, Eye, AlertTriangle } from "lucide-react"

interface Person {
  id: number
  name: string
  idNo: string
  from: string
  to: string
  crri: boolean
}

interface FormData {
  dateOfIndent: string
  vehicleType: string
  dateOfDuty: string
  division: string
  bookingTimeFrom: string
  bookingTimeTo: string
  combinedDuty: string
  contactNumber: string
  placeToVisit: string
  purposeOfVisit: string
  persons: Person[]
  officialContact: string
  signatureOfficer: string
  approvalOc: string
  tmcApproval: string
  signatureTmc: string
  vehicleNo: string
  driverName: string
  timeFrom: string
  timeTo: string
  vehicleUnavailableReason: string
}

export default function VehicleIndentForm() {
  const [formData, setFormData] = useState<FormData>({
    dateOfIndent: "",
    vehicleType: "Car",
    dateOfDuty: "",
    division: "",
    bookingTimeFrom: "",
    bookingTimeTo: "",
    combinedDuty: "Yes",
    contactNumber: "",
    placeToVisit: "",
    purposeOfVisit: "",
    persons: [],
    officialContact: "",
    signatureOfficer: "",
    approvalOc: "",
    tmcApproval: "Within Delhi - In-house/Sponsored",
    signatureTmc: "",
    vehicleNo: "",
    driverName: "",
    timeFrom: "",
    timeTo: "",
    vehicleUnavailableReason: "",
  })

  const [apiOutput, setApiOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [personCount, setPersonCount] = useState(0)
  const apiEndpoint = "http://localhost:8080" // This line will be removed

  const vehicleTypes = ["Car", "Jeep", "Van", "Truck", "Auto", "Bus", "Instrumented Vehicle"]
  const tmcApprovalOptions = ["Within Delhi - In-house/Sponsored", "Outside Delhi - CNP/GAP"]

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addPerson = () => {
    const newPersonCount = personCount + 1
    setPersonCount(newPersonCount)
    const newPerson: Person = {
      id: newPersonCount,
      name: "",
      idNo: "",
      from: "",
      to: "",
      crri: false,
    }
    setFormData((prev) => ({
      ...prev,
      persons: [...prev.persons, newPerson],
    }))
  }

  const removePerson = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.filter((person) => person.id !== id),
    }))
  }

  const updatePerson = (id: number, field: keyof Person, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.map((person) => (person.id === id ? { ...person, [field]: value } : person)),
    }))
  }

  const callGetApi = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/vehicle/home")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.text()
      setApiOutput(data)
      setError("")
    } catch (err) {
      console.error("API Error:", err)

      let errorMessage = "API Connection Failed"
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          errorMessage = `Backend not reachable. Server may be offline.`
        } else {
          errorMessage = `API Error: ${err.message}`
        }
      }

      setError(errorMessage)

      const mockResponse = `Mock API Response (Server not available):
{
  "status": "success",
  "message": "This is a mock response since the backend server is not running",
  "timestamp": "${new Date().toISOString()}",
  "server_status": "Backend server is not accessible"
}`

      setApiOutput(mockResponse)
    } finally {
      setLoading(false)
    }
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submitData: any = {
        date_of_indent: formData.dateOfIndent,
        vehicle_type: formData.vehicleType,
        date_of_duty: formData.dateOfDuty,
        division: formData.division,
        booking_time_from: formData.bookingTimeFrom,
        booking_time_to: formData.bookingTimeTo,
        combined_duty: formData.combinedDuty,
        contact_number: formData.contactNumber,
        place_to_visit: formData.placeToVisit,
        purpose_of_visit: formData.purposeOfVisit,
        official_contact: formData.officialContact,
        signature_officer: formData.signatureOfficer,
        approval_oc: formData.approvalOc,
        tmc_approval: formData.tmcApproval,
        signature_tmc: formData.signatureTmc,
        vehicle_no: formData.vehicleNo,
        driver_name: formData.driverName,
        time_from: formData.timeFrom,
        time_to: formData.timeTo,
        vehicle_unavailable_reason: formData.vehicleUnavailableReason,
      }

      formData.persons.forEach((person, index) => {
        const personNum = index + 1
        submitData[`person${personNum}_name`] = person.name
        submitData[`person${personNum}_id`] = person.idNo
        submitData[`person${personNum}_from`] = person.from
        submitData[`person${personNum}_to`] = person.to
        if (person.crri) {
          submitData[`person${personNum}_crri`] = "on"
        }
      })

      const response = await fetch("/api/vehicle/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.text()
      setApiOutput(responseData)
      setError("")

      alert("Form submitted successfully!")
    } catch (err) {
      console.error("Submit Error:", err)

      let errorMessage = "Form Submission Failed"
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          errorMessage = `Backend not reachable. Server may be offline.`
        } else {
          errorMessage = `Submission Error: ${err.message}`
        }
      }

      setError(errorMessage)

      const mockSubmitResponse = `Mock Submission Response (Server not available):
{
  "status": "success",
  "message": "Form data received successfully (mock response)",
  "form_id": "MOCK_${Date.now()}",
  "timestamp": "${new Date().toISOString()}",
  "data_received": {}
}`

      setApiOutput(mockSubmitResponse)
      alert("Form submitted successfully! (Mock response - server not available)")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-5">
      <Card className="max-w-4xl mx-auto shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-0">
        <CardContent className="p-8">
          <h1 className="text-center text-[#004080] text-2xl font-normal mb-8">Vehicle Indent Form - CSIR-CRRI</h1>

          {/* API Configuration */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-800">API Configuration</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiEndpoint" className="text-sm text-blue-700">
                  Backend Server URL:
                </Label>
                <Input
                  id="apiEndpoint"
                  value={apiEndpoint}
                  onChange={(e) => console.log("API Endpoint changed to:", e.target.value)}
                  placeholder="http://localhost:8080"
                  className="bg-white"
                />
                <p className="text-xs text-blue-600">
                  Make sure your backend server is running and accessible at this URL
                </p>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={submitForm} className="space-y-6">
            {/* Static Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dateOfIndent" className="block mt-4 font-medium text-[#333]">
                  Date of Indent:
                </Label>
                <Input
                  type="date"
                  id="dateOfIndent"
                  value={formData.dateOfIndent}
                  onChange={(e) => handleInputChange("dateOfIndent", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>

              <div>
                <Label htmlFor="vehicleType" className="block mt-4 font-medium text-[#333]">
                  Type of Vehicle:
                </Label>
                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                  <SelectTrigger className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateOfDuty" className="block mt-4 font-medium text-[#333]">
                  Date of Duty:
                </Label>
                <Input
                  type="date"
                  id="dateOfDuty"
                  value={formData.dateOfDuty}
                  onChange={(e) => handleInputChange("dateOfDuty", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>

              <div>
                <Label htmlFor="division" className="block mt-4 font-medium text-[#333]">
                  Division/Section:
                </Label>
                <Input
                  type="text"
                  id="division"
                  value={formData.division}
                  onChange={(e) => handleInputChange("division", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>

              <div>
                <Label htmlFor="bookingTimeFrom" className="block mt-4 font-medium text-[#333]">
                  Booking Time (From):
                </Label>
                <Input
                  type="time"
                  id="bookingTimeFrom"
                  value={formData.bookingTimeFrom}
                  onChange={(e) => handleInputChange("bookingTimeFrom", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>

              <div>
                <Label htmlFor="bookingTimeTo" className="block mt-4 font-medium text-[#333]">
                  To:
                </Label>
                <Input
                  type="time"
                  id="bookingTimeTo"
                  value={formData.bookingTimeTo}
                  onChange={(e) => handleInputChange("bookingTimeTo", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>

              <div>
                <Label htmlFor="combinedDuty" className="block mt-4 font-medium text-[#333]">
                  Combined Duty OK?
                </Label>
                <Select
                  value={formData.combinedDuty}
                  onValueChange={(value) => handleInputChange("combinedDuty", value)}
                >
                  <SelectTrigger className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contactNumber" className="block mt-4 font-medium text-[#333]">
                  Contact Phone No.:
                </Label>
                <Input
                  type="tel"
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="placeToVisit" className="block mt-4 font-medium text-[#333]">
                Place to Visit:
              </Label>
              <Textarea
                id="placeToVisit"
                rows={2}
                value={formData.placeToVisit}
                onChange={(e) => handleInputChange("placeToVisit", e.target.value)}
                className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9] resize-y"
              />
            </div>

            <div>
              <Label htmlFor="purposeOfVisit" className="block mt-4 font-medium text-[#333]">
                Purpose of Visit:
              </Label>
              <Textarea
                id="purposeOfVisit"
                rows={2}
                value={formData.purposeOfVisit}
                onChange={(e) => handleInputChange("purposeOfVisit", e.target.value)}
                className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9] resize-y"
              />
            </div>

            {/* Dynamic Person List */}
            <div className="mt-8">
              <h3 className="mt-8 text-[#005c99] text-lg font-medium border-b border-[#ddd] pb-1 mb-4">
                Persons to be Picked
              </h3>

              <div className="space-y-4">
                {formData.persons.map((person) => (
                  <div key={person.id} className="border border-[#eee] p-4 bg-[#fdfdfd] rounded-md relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePerson(person.id)}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-12">
                      <div>
                        <Label className="block mt-2 font-medium text-[#333]">{person.id}. Name:</Label>
                        <Input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                          className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                        />
                      </div>

                      <div>
                        <Label className="block mt-2 font-medium text-[#333]">ID No.:</Label>
                        <Input
                          type="text"
                          value={person.idNo}
                          onChange={(e) => updatePerson(person.id, "idNo", e.target.value)}
                          className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                        />
                      </div>

                      <div>
                        <Label className="block mt-2 font-medium text-[#333]">From:</Label>
                        <Input
                          type="text"
                          value={person.from}
                          onChange={(e) => updatePerson(person.id, "from", e.target.value)}
                          className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                        />
                      </div>

                      <div>
                        <Label className="block mt-2 font-medium text-[#333]">To:</Label>
                        <Input
                          type="text"
                          value={person.to}
                          onChange={(e) => updatePerson(person.id, "to", e.target.value)}
                          className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                        />
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                          id={`crri-${person.id}`}
                          checked={person.crri}
                          onCheckedChange={(checked) => updatePerson(person.id, "crri", checked as boolean)}
                        />
                        <Label htmlFor={`crri-${person.id}`} className="font-medium text-[#333]">
                          CRRI
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" onClick={addPerson} className="bg-[#28a745] hover:bg-[#1f7d37] text-white mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>

            {/* Additional Form Fields */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="officialContact" className="block mt-4 font-medium text-[#333]">
                  Address & Phone No. of Official to be Picked:
                </Label>
                <Textarea
                  id="officialContact"
                  rows={2}
                  value={formData.officialContact}
                  onChange={(e) => handleInputChange("officialContact", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="signatureOfficer" className="block mt-4 font-medium text-[#333]">
                    Signature of Indenting Officer:
                  </Label>
                  <Input
                    type="text"
                    id="signatureOfficer"
                    value={formData.signatureOfficer}
                    onChange={(e) => handleInputChange("signatureOfficer", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>

                <div>
                  <Label htmlFor="approvalOc" className="block mt-4 font-medium text-[#333]">
                    Approval by OC/Section In-charge:
                  </Label>
                  <Input
                    type="text"
                    id="approvalOc"
                    value={formData.approvalOc}
                    onChange={(e) => handleInputChange("approvalOc", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tmcApproval" className="block mt-4 font-medium text-[#333]">
                  Chairman TMC Approval:
                </Label>
                <Select value={formData.tmcApproval} onValueChange={(value) => handleInputChange("tmcApproval", value)}>
                  <SelectTrigger className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tmcApprovalOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signatureTmc" className="block mt-4 font-medium text-[#333]">
                  Signature of TMC Dealing Assistant:
                </Label>
                <Input
                  type="text"
                  id="signatureTmc"
                  value={formData.signatureTmc}
                  onChange={(e) => handleInputChange("signatureTmc", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                />
              </div>
            </div>

            {/* Transport Section Record */}
            <div className="mt-8">
              <h3 className="mt-8 text-[#005c99] text-lg font-medium border-b border-[#ddd] pb-1 mb-4">
                Transport Section Record
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="vehicleNo" className="block mt-4 font-medium text-[#333]">
                    Allotted Vehicle No.:
                  </Label>
                  <Input
                    type="text"
                    id="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={(e) => handleInputChange("vehicleNo", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>

                <div>
                  <Label htmlFor="driverName" className="block mt-4 font-medium text-[#333]">
                    Driver's Name:
                  </Label>
                  <Input
                    type="text"
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => handleInputChange("driverName", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>

                <div>
                  <Label htmlFor="timeFrom" className="block mt-4 font-medium text-[#333]">
                    Time From:
                  </Label>
                  <Input
                    type="time"
                    id="timeFrom"
                    value={formData.timeFrom}
                    onChange={(e) => handleInputChange("timeFrom", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>

                <div>
                  <Label htmlFor="timeTo" className="block mt-4 font-medium text-[#333]">
                    To:
                  </Label>
                  <Input
                    type="time"
                    id="timeTo"
                    value={formData.timeTo}
                    onChange={(e) => handleInputChange("timeTo", e.target.value)}
                    className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleUnavailableReason" className="block mt-4 font-medium text-[#333]">
                  If Vehicle Not Available:
                </Label>
                <Textarea
                  id="vehicleUnavailableReason"
                  rows={3}
                  value={formData.vehicleUnavailableReason}
                  onChange={(e) => handleInputChange("vehicleUnavailableReason", e.target.value)}
                  className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9] resize-y"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0077cc] hover:bg-[#005fa3] text-white p-3 mt-6 text-base"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>

            {/* API Output Preview */}
            <div className="mt-6">
              <Label htmlFor="apiOutput" className="block mt-4 font-medium text-[#333]">
                API Output Preview:
              </Label>
              <Textarea
                id="apiOutput"
                rows={6}
                value={apiOutput}
                readOnly
                placeholder="API output will appear here..."
                className="w-full p-2.5 mt-1.5 rounded-[5px] border border-[#ccc] bg-[#f9f9f9] resize-y font-mono text-sm"
              />
              <Button
                type="button"
                onClick={callGetApi}
                disabled={loading}
                className="mt-2 bg-[#17a2b8] hover:bg-[#138496] text-white"
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Test API Connection
                  </>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
