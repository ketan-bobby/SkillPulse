import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Users, UserPlus, UserMinus, Settings2, 
  Mail, Shield, Calendar, Trash2, Edit3, Search, Filter
} from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { AppHeader } from "@/components/app-header";

export default function ProjectGroupsPage() {
  const params = useParams();
  const projectId = params.id ? parseInt(params.id) : null;
  const [location, setLocation] = useLocation();
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Fetch groups data from database
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups", projectId],
    enabled: !!projectId,
  });

  // Fetch available employees from database
  const { data: availableEmployees = [] } = useQuery({
    queryKey: ["/api/users", "available"],
  });

  const handleBack = () => {
    const path = location.includes('/admin/') 
      ? `/admin/projects/${projectId}`
      : `/super-admin/projects/${projectId}`;
    setLocation(path);
  };

  const handleCreateGroup = () => {
    if (!newGroupName) return;
    
    // In real app, this would be an API call
    console.log("Creating group:", { name: newGroupName, description: newGroupDescription });
    setIsAddGroupOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
  };

  const handleAddMembers = () => {
    if (selectedMembers.length === 0) return;
    
    // In real app, this would be an API call
    console.log("Adding members to group:", { groupId: selectedGroup?.id, memberIds: selectedMembers });
    setIsAddMembersOpen(false);
    setSelectedMembers([]);
  };

  const handleRemoveMember = (groupId: number, memberId: number) => {
    // In real app, this would be an API call
    console.log("Removing member:", { groupId, memberId });
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Groups - {(project as any)?.name || "Loading..."}
              </h1>
              <p className="text-gray-600">
                Organize employees into groups for targeted testing
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsAddGroupOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Groups List */}
        <div className="grid gap-4">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {group.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {group.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {group.members.length} members
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      {group.tests} tests
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Members List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Team Members</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsAddMembersOpen(true);
                        }}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Members
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(group.id, member.id)}
                            >
                              <UserMinus className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Group Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Created {group.createdAt}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings2 className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Create your first group to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddGroupOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create First Group
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group to organize employees for testing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Frontend Team"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Input
                id="group-description"
                placeholder="Brief description of the group"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Members to {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Select employees to add to this group
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {availableEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedMembers.includes(employee.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMembers([...selectedMembers, employee.id]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== employee.id));
                        }
                      }}
                    />
                    <Label htmlFor={`employee-${employee.id}`} className="cursor-pointer flex-1">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.email}</p>
                      </div>
                    </Label>
                  </div>
                  <Badge variant="outline">{employee.role}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              {selectedMembers.length} employees selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddMembersOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMembers}>
                Add Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}