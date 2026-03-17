import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import ClientCaseProfile from '../components/cases/ClientCaseProfile';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  Inbox,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  User
} from 'lucide-react';
import { format } from 'date-fns';

export default function Communications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [selectedComm, setSelectedComm] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState({
    case_id: '',
    channel: 'email',
    to_name: '',
    to_contact: '',
    subject: '',
    content: ''
  });

  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communications', channelFilter],
    queryFn: () => channelFilter === 'all'
      ? apiClient.entities.Communication.list('-created_date', 100)
      : apiClient.entities.Communication.filter({ channel: channelFilter }, '-created_date', 100),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['casesForComms'],
    queryFn: () => apiClient.entities.Case.list('-created_date', 200),
  });

  const createCommMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Communication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      setNewMessageOpen(false);
      setNewMessage({
        case_id: '',
        channel: 'email',
        to_name: '',
        to_contact: '',
        subject: '',
        content: ''
      });
    },
  });

  const filteredComms = communications.filter(c =>
    !searchQuery ||
    c.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.from_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const unreadCount = communications.filter(c => !c.is_read && c.direction === 'inbound').length;
  const urgentCount = communications.filter(c => c.ai_sentiment === 'urgent').length;
  const pendingResponses = communications.filter(c => c.requires_response && c.direction === 'inbound').length;

  const channelIcons = {
    email: Mail,
    phone: Phone,
    sms: MessageSquare,
    portal_message: MessageSquare,
    mail: Mail,
    in_person: User
  };

  const sentimentColors = {
    positive: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-slate-100 text-slate-700',
    negative: 'bg-red-100 text-red-700',
    urgent: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            Communications Hub
          </h1>
          <p className="text-slate-500 mt-1">
            Manage client communications with AI-powered insights
          </p>
        </div>
        <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Select 
                  value={newMessage.case_id} 
                  onValueChange={(v) => {
                    const caseItem = cases.find(c => c.id === v);
                    setNewMessage({ 
                      ...newMessage, 
                      case_id: v,
                      to_name: caseItem?.claimant_name || '',
                      to_contact: caseItem?.claimant_email || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.claimant_name} - {c.case_number || c.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select 
                    value={newMessage.channel} 
                    onValueChange={(v) => setNewMessage({ ...newMessage, channel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="portal_message">Portal Message</SelectItem>
                      <SelectItem value="phone">Phone (Log Call)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={newMessage.to_contact}
                  onChange={(e) => setNewMessage({ ...newMessage, to_contact: e.target.value })}
                  placeholder="Contact (email/phone)"
                />
              </div>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                placeholder="Subject"
              />
              <Textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                placeholder="Message content..."
                rows={4}
              />
              <Button 
                className="w-full"
                onClick={() => createCommMutation.mutate({
                  ...newMessage,
                  direction: 'outbound',
                  communication_date: new Date().toISOString(),
                  from_name: 'Firm',
                })}
                disabled={!newMessage.case_id || !newMessage.content || createCommMutation.isPending}
              >
                {createCommMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700">{unreadCount}</p>
              <p className="text-sm text-blue-600">Unread Messages</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{urgentCount}</p>
              <p className="text-sm text-slate-500">Urgent</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{pendingResponses}</p>
              <p className="text-sm text-slate-500">Pending Response</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{communications.length}</p>
              <p className="text-sm text-slate-500">Total Messages</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={channelFilter} onValueChange={setChannelFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="portal_message">Portal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : filteredComms.length > 0 ? (
            <div className="divide-y">
              {filteredComms.map((comm) => {
                const ChannelIcon = channelIcons[comm.channel] || MessageSquare;
                const caseInfo = cases.find(c => c.id === comm.case_id);

                return (
                  <div 
                    key={comm.id} 
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !comm.is_read && comm.direction === 'inbound' ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => setSelectedComm(comm)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        comm.direction === 'inbound' ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <ChannelIcon className={`w-5 h-5 ${
                          comm.direction === 'inbound' ? 'text-blue-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">
                            {comm.direction === 'inbound' ? comm.from_name : comm.to_name}
                          </p>
                          {!comm.is_read && comm.direction === 'inbound' && (
                            <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                          )}
                          {comm.ai_sentiment && (
                            <Badge className={sentimentColors[comm.ai_sentiment]}>
                              {comm.ai_sentiment}
                            </Badge>
                          )}
                        </div>
                        {comm.subject && (
                          <p className="text-sm font-medium text-slate-700 mb-1">{comm.subject}</p>
                        )}
                        <p className="text-sm text-slate-500 line-clamp-2">{comm.content}</p>
                        {comm.ai_summary && (
                          <p className="text-xs text-purple-600 mt-2 italic">AI: {comm.ai_summary}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-500">
                          {comm.communication_date && format(new Date(comm.communication_date), 'MMM d, h:mm a')}
                        </p>
                        {caseInfo && (
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs cursor-pointer hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCaseId(comm.case_id);
                            }}
                          >
                            {caseInfo.claimant_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900">No communications</p>
              <p className="text-slate-500">Start by sending a message to a client</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedComm} onOpenChange={() => setSelectedComm(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Message Details
            </DialogTitle>
          </DialogHeader>
          {selectedComm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedComm.direction === 'inbound' ? 'From' : 'To'}: {
                      selectedComm.direction === 'inbound' ? selectedComm.from_name : selectedComm.to_name
                    }
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedComm.direction === 'inbound' ? selectedComm.from_contact : selectedComm.to_contact}
                  </p>
                </div>
                <Badge variant="outline">{selectedComm.channel}</Badge>
              </div>
              {selectedComm.subject && (
                <div>
                  <p className="text-sm text-slate-500">Subject</p>
                  <p className="font-medium">{selectedComm.subject}</p>
                </div>
              )}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedComm.content}</p>
              </div>
              {selectedComm.ai_action_items?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-2">AI-Identified Action Items</p>
                  <ul className="space-y-1">
                    {selectedComm.ai_action_items.map((item, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Client Case Profile Modal */}
      <ClientCaseProfile
        caseId={selectedCaseId}
        open={!!selectedCaseId}
        onOpenChange={(open) => !open && setSelectedCaseId(null)}
      />
    </div>
  );
}